// Quick script to add the specialists category and subcategories
const { sequelize, Category, SubCategory } = require('./database');

async function seedSpecialists() {
    await sequelize.authenticate();
    console.log('Connected to Database...');

    // Create the category if it doesn't exist
    const [category, created] = await Category.findOrCreate({
        where: { slug: 'specialists' },
        defaults: { name: 'Specialists', slug: 'specialists', icon: '🔧' }
    });
    console.log(created ? 'Created specialists category' : 'Specialists category already exists', 'ID:', category.id);

    // Create subcategories
    const subcats = [
        { slug: 'turnkey-renovation', name: 'Remont pod klyuch' },
        { slug: 'design-studios', name: 'Dizayn studiyalar' },
        { slug: 'plumbers', name: 'Santexniklar' },
        { slug: 'electricians', name: 'Elektrchilar' },
        { slug: 'painters', name: "Bo'yoqchilar" },
        { slug: 'tile-workers', name: 'Plitkachilar' },
        { slug: 'carpenters', name: 'Duradgorlar' },
        { slug: 'architects', name: 'Arxitektorlar' }
    ];

    for (const sub of subcats) {
        const [sc, scCreated] = await SubCategory.findOrCreate({
            where: { slug: sub.slug },
            defaults: { name: sub.name, CategoryId: category.id }
        });
        console.log(scCreated ? `  Created: ${sub.name}` : `  Already exists: ${sub.name}`);
    }

    console.log('Done!');
    process.exit(0);
}

seedSpecialists().catch(err => { console.error(err); process.exit(1); });
