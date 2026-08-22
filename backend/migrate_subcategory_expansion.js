/**
 * Fills out the subcategory taxonomy and repairs the specialists names.
 *
 * Three separate jobs, all safe to re-run:
 *
 * 1. Specialists translations. Seven of its eight subcategories had no
 *    Russian name at all, so Russian visitors saw "Plitkachilar" and
 *    "Duradgorlar". One of them, turnkey-renovation, was also not really
 *    Uzbek — "Remont pod klyuch" is Russian written in Latin letters.
 *
 * 2. New subcategories. Additive only. Nothing is re-tagged and no shop
 *    changes category, so an existing filter can never start returning a
 *    different set than it did before.
 *
 * 3. Ordering. `order` was incoherent — some categories used 0-6, others got
 *    globally sequential 7-39, three sat at 99 — so chips effectively fell
 *    back to insertion order and four empty ones led the row. This sorts each
 *    category's chips by how many shops they hold, most first, so the first
 *    chip a thumb reaches always returns results.
 *
 * Deliberately NOT done here, because each needs a human decision:
 *   - Consolidating tile into "Плитка и камень". The filter is scoped
 *     CategoryId AND SubCategoryId, so the subcategory cannot move without
 *     its shops, and floor-tiles holds flooring businesses (FloorCo, Vostok,
 *     Mir Kafel Tarkett) that belong in Напольные покрытия.
 *   - Rebuilding Мебель on one axis. Its 9 subcategories mix construction,
 *     product and room, but re-tagging 50 shops by room needs someone who
 *     knows the inventory.
 *   - An Инженерные системы category. Needs GRID_LAYOUTS and the desktop
 *     grid-template-areas reworked from 12 cells to 13.
 *
 *   node backend/migrate_subcategory_expansion.js --dry
 *   node backend/migrate_subcategory_expansion.js
 */
require('dotenv').config();
const { Category, SubCategory, sequelize } = require('./models');

const DRY = process.argv.includes('--dry');

// slug -> { name (uz), name_ru }
const SPECIALIST_NAMES = {
    'turnkey-renovation': { name: "Kalit topshirish sharti bilan ta'mir", name_ru: 'Ремонт под ключ' },
    'design-studios':     { name: 'Dizayn studiyalari',  name_ru: 'Дизайн-студии' },
    'plumbers':           { name: 'Santexniklar',        name_ru: 'Сантехники' },
    'painters':           { name: "Bo'yoqchilar",        name_ru: 'Маляры' },
    'tile-workers':       { name: 'Plitkachilar',        name_ru: 'Плиточники' },
    'carpenters':         { name: 'Duradgorlar',         name_ru: 'Столяры' },
    'architects':         { name: 'Arxitektorlar',       name_ru: 'Архитекторы' }
};

const NEW_SUBCATEGORIES = {
    'walls': [
        { slug: 'decorative-plaster', name: 'Dekorativ shtukaturka',   name_ru: 'Декоративная штукатурка' },
        { slug: 'drywall',            name: 'Gipskarton va profillar', name_ru: 'Гипсокартон и профили' },
        { slug: 'mouldings',          name: 'Moldinglar va bezaklar',  name_ru: 'Молдинги и лепнина' }
    ],
    'floor': [
        { slug: 'skirting', name: "Plintuslar va bo'sag'alar", name_ru: 'Плинтусы и пороги' },
        { slug: 'screed',   name: 'Quyma pollar va styajka',   name_ru: 'Наливные полы и стяжка' }
    ],
    'stone': [
        { slug: 'porcelain-stoneware', name: 'Keramogranit', name_ru: 'Керамогранит' },
        { slug: 'mosaic',              name: 'Mozaika',      name_ru: 'Мозаика' },
        { slug: 'countertops',         name: 'Ish yuzalari va derazaoldi taxtalari', name_ru: 'Столешницы и подоконники' }
    ],
    'bathroom': [
        { slug: 'bathtubs',      name: 'Vannalar va jakuzi',        name_ru: 'Ванны и джакузи' },
        { slug: 'toilets',       name: 'Unitazlar va installyatsiyalar', name_ru: 'Унитазы и инсталляции' },
        { slug: 'towel-warmers', name: 'Sochiq quritgichlar',       name_ru: 'Полотенцесушители' }
    ],
    'lighting': [
        { slug: 'chandeliers',    name: 'Qandillar',                name_ru: 'Люстры' },
        { slug: 'track-lighting', name: 'Trek tizimlari',           name_ru: 'Трековые системы' },
        { slug: 'led-strips',     name: 'LED lentalar va profillar', name_ru: 'LED-ленты и профили' }
    ],
    'furniture': [
        { slug: 'wardrobes',        name: 'Shkaflar va garderoblar', name_ru: 'Шкафы и гардеробные' },
        { slug: 'mattresses',       name: 'Matraslar',               name_ru: 'Матрасы' },
        { slug: 'kids-furniture',   name: 'Bolalar mebeli',          name_ru: 'Детская мебель' },
        { slug: 'office-furniture', name: 'Ofis mebeli',             name_ru: 'Офисная мебель' }
    ],
    'art-decor': [
        { slug: 'mirrors',        name: "Ko'zgular",           name_ru: 'Зеркала' },
        { slug: 'paintings',      name: 'Kartinalar va posterlar', name_ru: 'Картины и постеры' },
        { slug: 'vases-tableware', name: 'Vazalar va idishlar', name_ru: 'Вазы и посуда' }
    ],
    'real-estate': [
        { slug: 'decking',   name: 'Terrasalar va deking',   name_ru: 'Террасы и декинг' },
        { slug: 'canopies',  name: 'Soyabonlar va pergolalar', name_ru: 'Навесы и перголы' }
    ],
    'plants': [
        { slug: 'planters',   name: 'Gultuvaklar va idishlar', name_ru: 'Кашпо и горшки' },
        { slug: 'lawn',       name: 'Gazon',                   name_ru: 'Газон' },
        { slug: 'irrigation', name: "Sug'orish tizimlari",     name_ru: 'Системы полива' }
    ],
    'doors-windows': [
        { slug: 'sliding-systems', name: 'Suriladigan tizimlar va peregorodkalar', name_ru: 'Раздвижные системы и перегородки' },
        { slug: 'garage-doors',    name: 'Garaj va seksiyali darvozalar',          name_ru: 'Гаражные и секционные ворота' }
    ]
};

// Empty, and nothing in the catalogue sells it. A chip that returns nothing
// is worse than no chip.
const DELETE_EMPTY = [{ category: 'other', slug: 'acoustics' }];

async function run() {
    console.log(`${DRY ? '[dry run] ' : ''}Subcategory expansion\n`);

    // ── 1. specialists names ──────────────────────────────────────────────
    console.log('Specialists translations');
    const specialists = await Category.findOne({ where: { slug: 'specialists' } });
    if (!specialists) {
        console.log('  no specialists category — skipped');
    } else {
        for (const [slug, names] of Object.entries(SPECIALIST_NAMES)) {
            const sub = await SubCategory.findOne({ where: { CategoryId: specialists.id, slug } });
            if (!sub) { console.log(`  ${slug}: not found — skipped`); continue; }
            if (sub.name === names.name && sub.name_ru === names.name_ru) {
                console.log(`  ${slug}: already correct`);
                continue;
            }
            console.log(`  ${slug}: "${sub.name}" / ${JSON.stringify(sub.name_ru)}`);
            console.log(`  ${' '.repeat(slug.length)}  -> "${names.name}" / "${names.name_ru}"`);
            if (!DRY) await sub.update(names);
        }
    }

    // ── 2. new subcategories ──────────────────────────────────────────────
    console.log('\nNew subcategories');
    let added = 0;
    for (const [catSlug, specs] of Object.entries(NEW_SUBCATEGORIES)) {
        const cat = await Category.findOne({ where: { slug: catSlug } });
        if (!cat) { console.log(`  ${catSlug}: category missing — skipped`); continue; }
        for (const spec of specs) {
            const existing = await SubCategory.findOne({ where: { CategoryId: cat.id, slug: spec.slug } });
            if (existing) { console.log(`  ${catSlug}/${spec.slug}: already exists`); continue; }
            console.log(`  ${catSlug}/${spec.slug}: creating ("${spec.name_ru}")`);
            if (!DRY) await SubCategory.create({ ...spec, CategoryId: cat.id, order: 99 });
            added++;
        }
    }
    console.log(`  ${added} to add`);

    // ── 3. remove empty chips ─────────────────────────────────────────────
    console.log('\nEmpty subcategories');
    for (const { category, slug } of DELETE_EMPTY) {
        const cat = await Category.findOne({ where: { slug: category } });
        if (!cat) continue;
        const sub = await SubCategory.findOne({ where: { CategoryId: cat.id, slug } });
        if (!sub) { console.log(`  ${category}/${slug}: already gone`); continue; }
        const [[{ n }]] = await sequelize.query(
            `SELECT COUNT(*) n FROM ShopSubCategories WHERE SubCategoryId = ${sub.id}`);
        if (Number(n) > 0) {
            console.log(`  ${category}/${slug}: has ${n} shops now — KEPT, not deleting`);
            continue;
        }
        console.log(`  ${category}/${slug}: deleting (0 shops)`);
        if (!DRY) await sub.destroy();
    }

    // ── 4. order by how many shops each holds ─────────────────────────────
    console.log('\nOrdering (most shops first)');
    const cats = await Category.findAll({ order: [['id', 'ASC']] });
    for (const cat of cats) {
        const subs = await SubCategory.findAll({ where: { CategoryId: cat.id } });
        if (!subs.length) continue;
        const counted = [];
        for (const s of subs) {
            const [[{ n }]] = await sequelize.query(
                `SELECT COUNT(*) n FROM ShopSubCategories WHERE SubCategoryId = ${s.id}`);
            counted.push({ sub: s, n: Number(n) });
        }
        // Ties keep alphabetical order so the result is stable between runs.
        counted.sort((a, b) => b.n - a.n || (a.sub.name_ru || a.sub.name).localeCompare(b.sub.name_ru || b.sub.name, 'ru'));
        const order = counted.map((c, i) => `${c.sub.name_ru || c.sub.name} (${c.n})`).join(' · ');
        console.log(`  ${cat.slug}: ${order}`);
        if (!DRY) {
            for (let i = 0; i < counted.length; i++) await counted[i].sub.update({ order: i });
        }
    }

    console.log(DRY ? '\nDry run complete, nothing written.' : '\nDone.');
    await sequelize.close();
}

run().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
