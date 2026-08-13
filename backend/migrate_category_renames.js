/**
 * Renames five categories and moves the content their new names promise.
 *
 *   Стены              -> Стены и потолки       (+ ceiling subcategories, Potolok Uz)
 *   Камень             -> Плитка и камень       (+ tile subcategories, pure tile shops)
 *   Растения и цветы   -> Ландшафт и растения   (+ landscaping, pure landscape shops)
 *   Прочее             -> Разное                (label only)
 *   Ванная             -> Ванны и сантехника    (label only)
 *
 * Slugs are deliberately unchanged — every /shops?category= link, CSS grid-area
 * and tile image is keyed to them, while display names come from the i18n maps
 * in frontend/js/config.js.
 *
 * Shops are matched by name AND current category. 29 shop names in this
 * catalogue are duplicated across categories (Porcelanosa exists three times,
 * Fran Stone four) because cross-listing is done by creating a second Shop row.
 * Matching on name alone would pick an arbitrary row.
 *
 * Only shops tagged with *nothing but* the relevant subcategory are moved. A
 * shop selling tiles and laminate is a flooring retailer, not a tile
 * specialist, and moving it would strip Пол of its main stock.
 *
 * Idempotent: re-running reports no changes.
 *
 *   node backend/migrate_category_renames.js          # apply
 *   node backend/migrate_category_renames.js --dry    # show what would change
 */
require('dotenv').config();
const { Category, SubCategory, Shop, sequelize } = require('./models');

const DRY = process.argv.includes('--dry');

const RENAMES = {
    walls: 'Walls & Ceilings',
    stone: 'Tiles & Stone',
    plants: 'Landscape & Plants',
    bathroom: 'Bathroom & Plumbing',
    other: 'Miscellaneous'
};

const NEW_SUBCATEGORIES = {
    // Only the one that has a shop. Подвесные потолки and Потолочные панели are
    // the obvious companions, but nothing in the catalogue fills them yet and
    // an empty chip renders on the category page — the site already carries 9
    // zero-shop subcategories. Add them when there are shops to put in them.
    walls: [
        { slug: 'stretch-ceilings', name: 'Tarang shiftlar', name_ru: 'Натяжные потолки' }
    ],
    // Deliberately not reusing wall-tiles / floor-tiles: those stay under Walls
    // and Floor for the mixed retailers who still need them.
    // Only ceramic-tiles: the obvious second entry, porcelain-tiles, would have
    // no shops. Keramogranit is the one porcelain specialist and it already has
    // its own row under stone, so the chip would render empty — the site
    // already carries 9 zero-shop subcategories and does not need a tenth.
    stone: [
        { slug: 'ceramic-tiles', name: 'Keramik kafel', name_ru: 'Керамическая плитка' }
    ],
    // Distinct from the real-estate 'landscape' slug, which stays there for the
    // exterior contractors who also do pools, facades and roofing.
    plants: [
        { slug: 'landscaping', name: 'Landshaft dizayni', name_ru: 'Ландшафтный дизайн' }
    ]
};

// { shop name, the category it is in now, where it goes, how to tag it }
const MOVES = [
    { name: 'Potolok Uz',               from: 'lighting',    to: 'walls',  tag: 'stretch-ceilings' },
    { name: 'Keramin',                  from: 'walls',       to: 'stone',  tag: 'ceramic-tiles' },
    { name: 'Decomart',                 from: 'walls',       to: 'stone',  tag: 'ceramic-tiles' },
    { name: 'SuperPol',                 from: 'floor',       to: 'stone',  tag: 'ceramic-tiles' },
    { name: 'Gazon Landshaft Tashkent', from: 'real-estate', to: 'plants', tag: 'landscaping' },
    { name: 'Kalelica',                 from: 'real-estate', to: 'plants', tag: 'landscaping' },
    { name: 'Flowers Garden',           from: 'real-estate', to: 'plants', tag: 'landscaping' }
];

// Pure wall-tile shops that already have their own row under stone — moving
// their walls row would give them two rows in one category. Bahor Gullari and
// Azalea Garden are the same story for plants. The loop below also guards
// against this independently, so an omission here cannot corrupt data.
const ALREADY_PRESENT = ['Keramogranit', 'iTILE', 'Laminam', 'Porcelanosa', 'Bahor Gullari', 'Azalea Garden'];

async function run() {
    console.log(`${DRY ? '[dry run] ' : ''}Category renames\n`);

    const cats = {};
    for (const c of await Category.findAll()) cats[c.slug] = c;

    for (const [slug, name] of Object.entries(RENAMES)) {
        const c = cats[slug];
        if (!c) { console.log(`  ! no category "${slug}" — skipped`); continue; }
        if (c.name === name) { console.log(`  ${slug}: already "${name}"`); continue; }
        console.log(`  ${slug}: "${c.name}" -> "${name}"`);
        if (!DRY) await c.update({ name });
    }

    console.log('');
    const subBySlug = {};
    for (const [catSlug, specs] of Object.entries(NEW_SUBCATEGORIES)) {
        const c = cats[catSlug];
        if (!c) continue;
        const existing = await SubCategory.findAll({ where: { CategoryId: c.id } });
        existing.forEach(s => { subBySlug[s.slug] = s; });
        let order = existing.length;
        for (const spec of specs) {
            if (subBySlug[spec.slug]) { console.log(`  subcategory ${spec.slug}: already exists`); continue; }
            console.log(`  subcategory ${spec.slug}: creating under ${catSlug} ("${spec.name_ru}")`);
            if (!DRY) {
                subBySlug[spec.slug] = await SubCategory.create({ ...spec, CategoryId: c.id, order: order++ });
            }
        }
    }

    console.log('');
    for (const mv of MOVES) {
        const fromCat = cats[mv.from], toCat = cats[mv.to];
        if (!fromCat || !toCat) { console.log(`  ! unknown category in move for ${mv.name}`); continue; }

        // Match on name AND current category — names are not unique here.
        const shop = await Shop.findOne({ where: { name: mv.name, CategoryId: fromCat.id } });
        if (!shop) {
            const done = await Shop.findOne({ where: { name: mv.name, CategoryId: toCat.id } });
            console.log(done ? `  ${mv.name}: already moved` : `  ! ${mv.name}: not found in ${mv.from}`);
            continue;
        }

        // Never create a second row for the same shop inside one category. The
        // ALREADY_PRESENT list above is a description, not a safeguard — this
        // is the safeguard, and it caught Keramogranit, which was missing from
        // that list because it was built from a truncated duplicate scan.
        const twin = await Shop.findOne({ where: { name: mv.name, CategoryId: toCat.id } });
        if (twin) {
            console.log(`  ${mv.name}: skipped — already has a row in ${mv.to} (#${twin.id})`);
            continue;
        }

        console.log(`  ${mv.name}: ${mv.from} -> ${mv.to} / ${mv.tag}`);
        if (!DRY) {
            await shop.update({ CategoryId: toCat.id });
            const sub = subBySlug[mv.tag];
            if (sub) await shop.setSubCategories([sub.id]);
        }
    }

    if (ALREADY_PRESENT.length) {
        console.log(`\n  Not moved — each already has its own row in the destination category:`);
        ALREADY_PRESENT.forEach(n => console.log(`    - ${n}`));
    }

    console.log(`\n${DRY ? 'Dry run complete, nothing written.' : 'Done.'}`);
    await sequelize.close();
}

run().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
