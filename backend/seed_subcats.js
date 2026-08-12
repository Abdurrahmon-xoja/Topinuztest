const { sequelize, Category, SubCategory } = require('./database');

const subCategoriesData = {
  "furniture": [
    { slug: 'soft-furniture', name: 'Yumshoq mebel' },
    { slug: 'cabinet-furniture', name: 'Korpusnaya mebel' },
    { slug: 'kitchen-furniture', name: 'Oshxona mebeli' },
    { slug: 'bedroom-furniture', name: 'Yotoqxona' },
    { slug: 'outdoor-furniture', name: 'Bog‘ mebeli' },
    { slug: 'tables', name: 'Stollar' }
  ],
  "lighting": [
    { slug: 'ceiling-lighting', name: 'Shift chiroqlari' },
    { slug: 'wall-lighting', name: 'Devor chiroqlari' },
    { slug: 'floor-lighting', name: 'Pol va stol lampalari' },
    { slug: 'street-lighting', name: 'Tashqi yoritish' },
    { slug: 'tech-lighting', name: 'Texnik yoritish' }
  ],
  "art-decor": [
    { slug: 'wall-decor', name: 'Devor dekori' },
    { slug: 'sculptures', name: 'Haykaltaroshlik' },
    { slug: 'textile', name: 'To‘qimachilik' },
    { slug: 'accessories', name: 'Aksessuarlar' }
  ],
  "walls": [
    { slug: 'paint', name: 'Bo‘yoqlar' },
    { slug: 'wallpaper', name: 'Gulqog‘ozlar' },
    { slug: 'panels', name: 'Panellar' },
    { slug: 'wall-tiles', name: 'Kafel' }
  ],
  "floor": [
    { slug: 'wood-floor', name: 'Yog‘ochli qoplamalar' },
    { slug: 'laminate', name: 'Laminat va vinil' },
    { slug: 'floor-tiles', name: 'Kafel' },
    { slug: 'carpet', name: 'Yumshoq qoplamalar' }
  ],
  "stone": [
    { slug: 'natural-stone', name: 'Tabiiy tosh' },
    { slug: 'artificial-stone', name: 'Sun’iy tosh' },
    { slug: 'format', name: 'Format' }
  ],
  "real-estate": [
    { slug: 'facade', name: 'Fasad materiallari' },
    { slug: 'roofing', name: 'Krovlya va vodostoki' },
    { slug: 'landscape', name: 'Landshaft' },
    { slug: 'pools', name: 'Basseynlar' },
    { slug: 'fences', name: 'Zaborlar va avtomatik darvozalar' },
    { slug: 'facade-lights', name: 'Arxitektura yoritilishi' }
  ],
  "plants": [
    // The category holds two distinct trades: artificial-flower wholesalers
    // (Cveti Tashkent, SUNIY GULLAR, Mega Flowers Uz …) and live-plant /
    // greening studios (Fitomir, Green Style, Botanicals …). Only the first
    // had a subcategory, so the second had nowhere to sit.
    { slug: 'artificial-plants', name: 'Sun’iy o‘simliklar', name_ru: 'Искусственные растения' },
    { slug: 'live-plants', name: 'Jonli o‘simliklar', name_ru: 'Живые растения' },
    { slug: 'flowers', name: 'Gullar va guldastalar', name_ru: 'Цветы и букеты' },
    { slug: 'phytodesign', name: 'Fitodizayn va ko‘kalamzorlashtirish', name_ru: 'Фитодизайн и озеленение' }
  ],
  "bathroom": [
    { slug: 'plumbing', name: 'Santexnika' },
    { slug: 'shower', name: 'Dush' },
    { slug: 'faucets', name: 'Smesitellar va aksessuarlar' },
    { slug: 'bathroom-furniture', name: 'Vanna mebellari' }
  ],
  "other": [
    { slug: 'furniture-fittings', name: 'Furnituralar' },
    { slug: 'smart-home', name: 'Texnika' },
    { slug: 'acoustics', name: 'Akustika' }
  ],
  "specialists": [
    { slug: 'turnkey-renovation', name: 'Remont pod klyuch' },
    { slug: 'design-studios', name: 'Dizayn studiyalar' },
    { slug: 'plumbers', name: 'Santexniklar' },
    { slug: 'electricians', name: 'Elektrchilar' },
    { slug: 'painters', name: 'Bo\'yoqchilar' },
    { slug: 'tile-workers', name: 'Plitkachilar' },
    { slug: 'carpenters', name: 'Duradgorlar' },
    { slug: 'architects', name: 'Arxitektorlar' }
  ]
};

async function seed() {
    await sequelize.authenticate();
    console.log('Connected to Database...');
    
    // For each main category in data
    for (const [catSlug, subCats] of Object.entries(subCategoriesData)) {
        // Find existing Category
        const category = await Category.findOne({ where: { slug: catSlug } });
        
        if (category) {
            console.log(`Seeding subcategories for Category: ${catSlug} (ID: ${category.id})`);
            
            for (const sub of subCats) {
                // Upsert Subcategory
                const [sc, created] = await SubCategory.findOrCreate({
                    where: { slug: sub.slug },
                    defaults: {
                        name: sub.name,
                        CategoryId: category.id
                    }
                });
                
                // Keep it synced if it already exists but doesn't have the CategoryId
                if (!created && sc.CategoryId !== category.id) {
                    sc.CategoryId = category.id;
                    await sc.save();
                }
            }
        } else {
            console.log(`Warning: Category ${catSlug} not found in DB!`);
        }
    }
    
    console.log('Subcategories seeded successfully!');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
