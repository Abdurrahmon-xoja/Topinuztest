/**
 * Plants -> Plants & Flowers.
 *
 * The category had exactly one subcategory, "artificial plants", but holds two
 * distinct trades: artificial-flower wholesalers, for whom that label is
 * correct, and live-plant / greening studios, who had nowhere to sit. This adds
 * the missing subcategories and tags each shop from what it actually sells.
 *
 * Idempotent: re-running finds the existing rows and re-applies the same tags.
 * Shops whose description gives no signal are left on whatever they already
 * have and reported at the end for a human to decide.
 *
 *   node backend/migrate_plants_flowers.js          # apply
 *   node backend/migrate_plants_flowers.js --dry    # show what would change
 */
require('dotenv').config();
const { Category, SubCategory, Shop, sequelize } = require('./models');

const DRY = process.argv.includes('--dry');

const NEW_SUBCATEGORIES = [
    { slug: 'live-plants', name: 'Jonli o‘simliklar', name_ru: 'Живые растения' },
    { slug: 'flowers', name: 'Gullar va guldastalar', name_ru: 'Цветы и букеты' },
    { slug: 'phytodesign', name: 'Fitodizayn va ko‘kalamzorlashtirish', name_ru: 'Фитодизайн и озеленение' }
];

// Assignments derived from each shop's own uz/ru description. Anything not
// listed here had no usable signal and is deliberately left alone.
const ASSIGNMENTS = {
    'artificial-plants': [
        'Cveti Tashkent',            // Искусственные цветы оптом
        'DecoFlowers',               // Оптовая и розничная продажа искусственных цветов
        'Flowers Plants Uzbekistan', // Искусственные цветы Оптом
        'Mega Flowers Uz',           // Искусственные цветы и деревья
        'SUNIY GULLAR',              // Искусственные цветы | Оптом и в розницу
        'Tokcha Decor',              // Оригинальные композиции из искусственных цветов
        'Sayde Decor'                // Композиции, которые выглядят как живые
    ],
    'live-plants': [
        'Azalea Garden',             // Декоративные растения из Европы
        'Bahor Gullari',             // центр декоративных растений в Ташкенте
        'Green Town Studio'          // Студия Растений
    ],
    'phytodesign': [
        'Botanicals',                // студия фитодизайна
        'Fitomir Company',           // услуги по озеленению
        'Greeen',                    // Все виды озеленения
        'Green Style'                // Вертикальное Озеленение
    ],
    'flowers': [
        'GOODVEEN',                  // Мастерская флористики
        'Lavandecor'                 // Цветочные композиции и интерьерные декоры
    ]
};

async function run() {
    const category = await Category.findOne({ where: { slug: 'plants' } });
    if (!category) throw new Error('No category with slug "plants" — nothing to migrate.');

    console.log(`${DRY ? '[dry run] ' : ''}Category #${category.id} "${category.name}"\n`);

    // 1. Rename the category itself. Display names come from the frontend i18n
    //    maps keyed by slug, so the slug must not change — every existing
    //    /shops?category=plants link and the CSS grid-area depend on it.
    if (category.name !== 'Plants & Flowers') {
        console.log(`  rename: "${category.name}" -> "Plants & Flowers"`);
        if (!DRY) await category.update({ name: 'Plants & Flowers' });
    } else {
        console.log('  rename: already applied');
    }

    // 2. Give the existing subcategory its missing Russian name.
    const artificial = await SubCategory.findOne({
        where: { CategoryId: category.id, slug: 'artificial-plants' }
    });
    if (artificial && !artificial.name_ru) {
        console.log('  artificial-plants: adding name_ru "Искусственные растения"');
        if (!DRY) await artificial.update({ name_ru: 'Искусственные растения' });
    }

    // 3. Add the missing subcategories.
    const existing = await SubCategory.findAll({ where: { CategoryId: category.id } });
    let order = existing.length;
    const bySlug = {};
    existing.forEach(s => { bySlug[s.slug] = s; });

    for (const spec of NEW_SUBCATEGORIES) {
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

    // 4. Re-tag the shops.
    const shops = await Shop.findAll({ where: { CategoryId: category.id } });
    const byName = {};
    shops.forEach(s => { byName[s.name] = s; });

    const assigned = new Set();
    console.log('');
    for (const [slug, names] of Object.entries(ASSIGNMENTS)) {
        const sub = bySlug[slug];
        for (const name of names) {
            const shop = byName[name];
            if (!shop) { console.log(`  ! no shop named "${name}" — skipped`); continue; }
            assigned.add(name);
            console.log(`  ${name} -> ${slug}`);
            if (!DRY && sub) await shop.setSubCategories([sub.id]);
        }
    }

    const untouched = shops.map(s => s.name).filter(n => !assigned.has(n));
    if (untouched.length) {
        console.log(`\n  Left unchanged — description gave no clear signal, please review:`);
        untouched.forEach(n => console.log(`    - ${n}`));
    }

    console.log(`\n${DRY ? 'Dry run complete, nothing written.' : 'Done.'}`);
    await sequelize.close();
}

run().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
