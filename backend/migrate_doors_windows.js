/**
 * Adds the Doors & Windows category to an existing database.
 *
 * Four shops already in the catalogue sell exactly this and are filed
 * elsewhere for want of a home — DoorHan under Exterior, MAFF under Floor,
 * and Nobel Premium and Aluframe under Other. They are moved here, so the
 * category is not empty on the day it appears.
 *
 * Idempotent: re-running finds the existing rows and leaves them alone.
 *
 *   node backend/migrate_doors_windows.js          # apply
 *   node backend/migrate_doors_windows.js --dry    # show what would change
 */
require('dotenv').config();
const { Category, SubCategory, Shop, sequelize } = require('./models');

const DRY = process.argv.includes('--dry');

const SUBCATEGORIES = [
    { slug: 'interior-doors', name: 'Ichki eshiklar', name_ru: 'Межкомнатные двери' },
    { slug: 'entrance-doors', name: 'Kirish eshiklari', name_ru: 'Входные двери' },
    { slug: 'windows', name: 'Derazalar', name_ru: 'Окна' },
    { slug: 'balcony-glazing', name: 'Balkon oynalash', name_ru: 'Остекление балконов' },
    { slug: 'door-window-hardware', name: 'Eshik va deraza furniturasi', name_ru: 'Дверная и оконная фурнитура' }
];

// Shop name -> which category it is in now, and the subcategory it belongs in.
// The current category is part of the match on purpose: 29 shop names in this
// catalogue are duplicated across categories, because cross-listing is done by
// creating a second Shop row. Aluframe is one of them — it exists under both
// 'other' and 'real-estate', and matching on name alone picks an arbitrary row.
const MOVE_SHOPS = {
    'DoorHan':       { from: 'real-estate', tag: 'entrance-doors' },
    'MAFF':          { from: 'floor',       tag: 'interior-doors' },
    'Nobel Premium': { from: 'other',       tag: 'door-window-hardware' },
    'Aluframe':      { from: 'other',       tag: 'windows' }
};

async function run() {
    console.log(`${DRY ? '[dry run] ' : ''}Doors & Windows\n`);

    let category = await Category.findOne({ where: { slug: 'doors-windows' } });
    if (category) {
        console.log(`  category: already exists (#${category.id})`);
    } else {
        console.log('  category: creating "Doors & Windows" (slug doors-windows)');
        if (!DRY) {
            category = await Category.create({ name: 'Doors & Windows', slug: 'doors-windows', icon: '🚪' });
        }
    }
    if (DRY && !category) {
        console.log('\n  (dry run cannot continue past creation — nothing written)');
        await sequelize.close();
        return;
    }

    const existing = await SubCategory.findAll({ where: { CategoryId: category.id } });
    const bySlug = {};
    existing.forEach(s => { bySlug[s.slug] = s; });
    let order = existing.length;

    for (const spec of SUBCATEGORIES) {
        if (bySlug[spec.slug]) {
            console.log(`  subcategory ${spec.slug}: already exists`);
            continue;
        }
        console.log(`  subcategory ${spec.slug}: creating ("${spec.name_ru}")`);
        if (!DRY) {
            bySlug[spec.slug] = await SubCategory.create({
                ...spec, CategoryId: category.id, order: order++
            });
        }
    }

    console.log('');
    for (const [name, spec] of Object.entries(MOVE_SHOPS)) {
        const fromCat = await Category.findOne({ where: { slug: spec.from } });
        if (!fromCat) { console.log(`  ! no category "${spec.from}" — skipped ${name}`); continue; }

        const shop = await Shop.findOne({ where: { name, CategoryId: fromCat.id } });
        if (!shop) {
            const done = await Shop.findOne({ where: { name, CategoryId: category.id } });
            console.log(done ? `  ${name}: already moved` : `  ! ${name}: not found in ${spec.from}`);
            continue;
        }

        console.log(`  ${name}: ${spec.from} -> Doors & Windows / ${spec.tag}`);
        if (!DRY) {
            await shop.update({ CategoryId: category.id });
            const sub = bySlug[spec.tag];
            if (sub) await shop.setSubCategories([sub.id]);
        }
    }

    console.log(`\n${DRY ? 'Dry run complete, nothing written.' : 'Done.'}`);
    await sequelize.close();
}

run().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
