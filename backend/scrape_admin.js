const { sequelize, Shop, ShopImage, Category, SubCategory, Product } = require('./models');

async function run() {
    try {
        console.log('Starting data migration from topin.uz...');

        // 1. Fetch Categories, Subcategories, and Shops from production
        console.log('Fetching categories...');
        const catRes = await fetch('https://topin.uz/api/categories');
        const catJson = await catRes.json();
        const productionCategories = catJson.data || [];
        console.log(`Fetched ${productionCategories.length} categories.`);

        console.log('Fetching subcategories...');
        const subRes = await fetch('https://topin.uz/api/subcategories');
        const subJson = await subRes.json();
        const productionSubcategories = subJson.data || [];
        console.log(`Fetched ${productionSubcategories.length} subcategories.`);

        console.log('Fetching shops (with embedded gallery images and subcategories)...');
        const shopsRes = await fetch('https://topin.uz/api/shops');
        const shopsJson = await shopsRes.json();
        const productionShops = shopsJson.data || [];
        console.log(`Fetched ${productionShops.length} shops.`);

        // 2. Disable foreign key checks for clean truncation
        if (sequelize.getDialect() === 'sqlite') {
            await sequelize.query('PRAGMA foreign_keys = false;');
        }

        // 3. Clear database tables
        console.log('Truncating tables...');
        await Product.destroy({ where: {} });
        await ShopImage.destroy({ where: {} });
        await Shop.destroy({ where: {} });
        await SubCategory.destroy({ where: {} });
        await Category.destroy({ where: {} });
        try {
            await sequelize.query('DELETE FROM ShopSubCategories;');
        } catch (e) {}

        // 4. Import Categories
        console.log('Importing categories...');
        const categoryDocs = [];
        for (const cat of productionCategories) {
            const doc = await Category.create({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon
            });
            categoryDocs.push(doc);
        }

        // 5. Import Subcategories
        console.log('Importing subcategories...');
        const subcatDocs = [];
        for (const sub of productionSubcategories) {
            const doc = await SubCategory.create({
                id: sub.id,
                name: sub.name,
                name_ru: sub.name_ru,
                name_en: sub.name_en,
                slug: sub.slug,
                order: sub.order,
                CategoryId: sub.CategoryId
            });
            subcatDocs.push(doc);
        }

        // 6. Import Shops, ShopImages, and ShopSubCategories mappings
        console.log('Importing shops, gallery images, and subcategory mappings...');

        // Production has shops sharing a slug even though the model declares it
        // unique, so its Postgres never enforced the constraint. SQLite does, and
        // /stores/:slug is a findOne anyway — so the extras are unreachable upstream.
        // Suffix the repeats with their id to keep every shop importable and visible.
        const seenSlugs = new Set();
        const duplicateSlugs = [];

        for (const prodShop of productionShops) {
            let slug = prodShop.slug;
            if (slug && seenSlugs.has(slug)) {
                duplicateSlugs.push(`${slug} (shop ${prodShop.id}: ${prodShop.name})`);
                slug = `${slug}-${prodShop.id}`;
            }
            if (slug) seenSlugs.add(slug);

            // vendorUsername / vendorPassword are deliberately not imported.
            const createdShop = await Shop.create({
                id: prodShop.id,
                name: prodShop.name,
                name_ru: prodShop.name_ru,
                description: prodShop.description,
                description_ru: prodShop.description_ru,
                location: prodShop.location,
                locationLink: prodShop.locationLink,
                latitude: prodShop.latitude,
                longitude: prodShop.longitude,
                website: prodShop.website,
                instagram: prodShop.instagram,
                telegram: prodShop.telegram,
                phone: prodShop.phone,
                customLinks: typeof prodShop.customLinks === 'string' ? prodShop.customLinks : JSON.stringify(prodShop.customLinks),
                socialPlatform: prodShop.socialPlatform,
                socialUrl: prodShop.socialUrl,
                logoUrl: prodShop.logoUrl,
                bannerUrl: prodShop.bannerUrl,
                workingHours: typeof prodShop.workingHours === 'string' ? prodShop.workingHours : JSON.stringify(prodShop.workingHours),
                currency: prodShop.currency || 'UZS',
                baseRating: prodShop.baseRating,
                baseRatingCount: prodShop.baseRatingCount,
                rating: prodShop.rating,
                reviewsCount: prodShop.reviewsCount,
                featuredOrder: prodShop.featuredOrder,
                slug,
                CategoryId: prodShop.CategoryId,
                isActive: prodShop.isActive
            });

            // Import ShopImages
            if (prodShop.ShopImages && prodShop.ShopImages.length > 0) {
                for (const img of prodShop.ShopImages) {
                    await ShopImage.create({
                        id: img.id,
                        url: img.url,
                        order: img.order,
                        ShopId: createdShop.id
                    });
                }
            }

            // Import ShopSubCategories
            if (prodShop.SubCategories && prodShop.SubCategories.length > 0) {
                for (const sub of prodShop.SubCategories) {
                    try {
                        await sequelize.query(
                            'INSERT INTO ShopSubCategories (ShopId, SubCategoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
                            {
                                replacements: [createdShop.id, sub.id, new Date(), new Date()]
                            }
                        );
                    } catch (e) {
                        console.error(`Error inserting ShopSubCategory mapping for Shop ${createdShop.id} and SubCategory ${sub.id}:`, e.message);
                    }
                }
            }
        }

        if (duplicateSlugs.length > 0) {
            console.warn(`\n⚠️  ${duplicateSlugs.length} shops share a slug with an earlier shop.`);
            console.warn('   Upstream these are unreachable: /stores/:slug is a findOne, so only');
            console.warn('   the first match ever renders. Imported here with an -id suffix.');
            for (const s of duplicateSlugs) console.warn(`     - ${s}`);
            console.warn('');
        }

        // 7. Import Products, paging until the API returns a short page
        console.log('Fetching and importing products...');
        let productCount = 0;
        for (let page = 1; ; page++) {
            const res = await fetch(`https://topin.uz/api/products?page=${page}&limit=100&includeDrafts=true`);
            const json = await res.json();
            const batch = json.data || [];
            if (batch.length === 0) break;

            for (const p of batch) {
                await Product.create({
                    id: p.id,
                    name: p.name,
                    name_ru: p.name_ru,
                    slug: p.slug,
                    shortDescription: p.shortDescription,
                    shortDescription_ru: p.shortDescription_ru,
                    description: p.description,
                    description_ru: p.description_ru,
                    price: p.price,
                    salePrice: p.salePrice,
                    imageUrl: p.imageUrl,
                    images: typeof p.images === 'string' ? p.images : JSON.stringify(p.images),
                    stockStatus: p.stockStatus || 'In Stock',
                    glbUrl: p.glbUrl,
                    usdzUrl: p.usdzUrl,
                    zipUrl: p.zipUrl,
                    tags: p.tags,
                    seoTitle: p.seoTitle,
                    seoDescription: p.seoDescription,
                    baseRating: p.baseRating,
                    baseRatingCount: p.baseRatingCount,
                    rating: p.rating,
                    reviewsCount: p.reviewsCount,
                    isPublished: p.isPublished,
                    isAvailable: p.isAvailable,
                    ShopId: p.ShopId,
                    CategoryId: p.CategoryId,
                    SubCategoryId: p.SubCategoryId
                });
                productCount++;
            }

            if (batch.length < 100) break;
        }
        console.log(`Imported ${productCount} products.`);

        // Re-enable foreign key checks
        if (sequelize.getDialect() === 'sqlite') {
            await sequelize.query('PRAGMA foreign_keys = true;');
        }

        console.log('Scrape and import migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
