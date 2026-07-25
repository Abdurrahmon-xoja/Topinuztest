const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Shop, ShopImage } = require('../models');

async function run() {
    try {
        console.log("Checking Shop logos and banners...");
        const shops = await Shop.findAll();
        let shopDownloaded = 0;
        
        for (const shop of shops) {
            // Check logo
            if (shop.logoUrl && shop.logoUrl.startsWith('/uploads/')) {
                const filePath = path.join(__dirname, '../../frontend', shop.logoUrl);
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                if (!fs.existsSync(filePath)) {
                    const filename = path.basename(filePath);
                    const cloudUrl = `https://res.cloudinary.com/dvceoakyu/image/upload/houz_shops/${filename}`;
                    console.log(`Downloading Shop Logo: ${filename} from Cloudinary...`);
                    try {
                        execSync(`curl -s -L -f -o "${filePath}" "${cloudUrl}"`);
                        shopDownloaded++;
                        console.log(`Successfully downloaded logo for Shop ID ${shop.id} (${shop.name})`);
                    } catch (e) {
                        console.error(`Failed to download logo for Shop ID ${shop.id}: ${e.message}`);
                    }
                }
            }
            
            // Check banner
            if (shop.bannerUrl && shop.bannerUrl.startsWith('/uploads/')) {
                const filePath = path.join(__dirname, '../../frontend', shop.bannerUrl);
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                if (!fs.existsSync(filePath)) {
                    const filename = path.basename(filePath);
                    const cloudUrl = `https://res.cloudinary.com/dvceoakyu/image/upload/houz_shops/${filename}`;
                    console.log(`Downloading Shop Banner: ${filename} from Cloudinary...`);
                    try {
                        execSync(`curl -s -L -f -o "${filePath}" "${cloudUrl}"`);
                        shopDownloaded++;
                        console.log(`Successfully downloaded banner for Shop ID ${shop.id} (${shop.name})`);
                    } catch (e) {
                        console.error(`Failed to download banner for Shop ID ${shop.id}: ${e.message}`);
                    }
                }
            }
        }
        console.log(`Total shop files downloaded: ${shopDownloaded}`);

        console.log("Checking ShopImage gallery URLs...");
        const shopImages = await ShopImage.findAll();
        let galleryDownloaded = 0;
        
        for (const img of shopImages) {
            if (img.url && img.url.startsWith('/uploads/')) {
                const filePath = path.join(__dirname, '../../frontend', img.url);
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                if (!fs.existsSync(filePath)) {
                    const filename = path.basename(filePath);
                    const cloudUrl = `https://res.cloudinary.com/dvceoakyu/image/upload/houz_shops_gallery/${filename}`;
                    console.log(`Downloading Gallery Image: ${filename} from Cloudinary...`);
                    try {
                        execSync(`curl -s -L -f -o "${filePath}" "${cloudUrl}"`);
                        galleryDownloaded++;
                        console.log(`Successfully downloaded gallery image ID ${img.id} (Shop ID ${img.ShopId})`);
                    } catch (e) {
                        console.error(`Failed to download gallery image ID ${img.id}: ${e.message}`);
                    }
                }
            }
        }
        console.log(`Total gallery images downloaded: ${galleryDownloaded}`);
        console.log("Missing image check and download process completed!");
    } catch (err) {
        console.error("Downloader script failed:", err);
    }
}

run().then(() => process.exit(0));
