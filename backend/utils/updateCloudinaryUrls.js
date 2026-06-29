const { Shop, ShopImage } = require('../models');

async function run() {
    try {
        console.log("Updating Shop logos/banners...");
        const shops = await Shop.findAll();
        let shopUpdated = 0;
        for (const shop of shops) {
            let changed = false;
            if (shop.logoUrl && shop.logoUrl.includes('houz_shops/')) {
                const filename = shop.logoUrl.split('/').pop();
                shop.logoUrl = `/uploads/houz_shops/${filename}`;
                changed = true;
            }
            if (shop.bannerUrl && shop.bannerUrl.includes('houz_shops/')) {
                const filename = shop.bannerUrl.split('/').pop();
                shop.bannerUrl = `/uploads/houz_shops/${filename}`;
                changed = true;
            }
            if (changed) {
                await shop.save();
                shopUpdated++;
                console.log(`Updated Shop ID ${shop.id} (${shop.name})`);
            }
        }
        console.log(`Total shops updated: ${shopUpdated}`);

        console.log("Updating ShopImage gallery URLs...");
        const shopImages = await ShopImage.findAll();
        let galleryUpdated = 0;
        for (const img of shopImages) {
            if (img.url && img.url.includes('houz_shops_gallery/')) {
                const filename = img.url.split('/').pop();
                img.url = `/uploads/houz_shops_gallery/${filename}`;
                await img.save();
                galleryUpdated++;
                console.log(`Updated ShopImage ID ${img.id} (Shop ID ${img.ShopId})`);
            }
        }
        console.log(`Total gallery images updated: ${galleryUpdated}`);
        console.log("Successfully completed database migration to local paths!");
    } catch (err) {
        console.error("Migration failed:", err);
    }
}

run().then(() => process.exit(0));
