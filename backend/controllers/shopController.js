const { Shop, ShopImage, SubCategory, Category, User, Review, ShopProductGroup, sequelize } = require('../models');
const { Op } = require('sequelize');
const sharp = require('sharp');
const slugify = require('../utils/slugify');
const { uploadBuffer } = require('../utils/uploader');
const { recalculateShopRating } = require('../utils/ratingHelper');

// Gallery photos are rendered by .shop-carousel at aspect-ratio 16/10
// (frontend/css/topin.css), and the admin cropper now hands us exactly that
// shape. Squaring them here to 1000x1000 cover re-cropped the image a second
// time and discarded the left and right edges the admin had just framed.
// Matching 16:10 makes this a plain downscale rather than a crop.
const GALLERY_WIDTH = 1600;
const GALLERY_HEIGHT = 1000;

const processGalleryImage = (buffer) =>
    sharp(buffer)
        .resize(GALLERY_WIDTH, GALLERY_HEIGHT, {
            fit: 'cover',
            position: 'centre',
            withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();

const shopIncludes = [
    { model: SubCategory, through: { attributes: [] } },
    { model: Category, attributes: ['id', 'name', 'slug', 'icon'] },
    { model: ShopImage, attributes: ['id', 'url', 'order'] },
    // The shop's own product groups, so its storefront can render the pill bar
    // in the owner's order. Not included in getAllShops — the shops listing has
    // no use for them and it is a hot, cached query.
    { model: ShopProductGroup, attributes: ['id', 'name', 'name_ru', 'slug', 'order'] }
];

const bcrypt = require('bcryptjs');

const syncShopVendorAccount = async (shop, storeEnabled) => {
    const isEnabled = storeEnabled === true || storeEnabled === 'true' || storeEnabled === 1 || storeEnabled === '1';
    if (isEnabled) {
        let user = await User.findOne({ where: { ShopId: shop.id, role: 'vendor' } });
        if (!user) {
            const vendorUsername = `${shop.slug}_admin`;
            const vendorPassword = `${shop.slug}_pass2026`;
            const hashedPassword = await bcrypt.hash(vendorPassword, 12);

            user = await User.create({
                username: vendorUsername,
                password: hashedPassword,
                role: 'vendor',
                ShopId: shop.id
            });
            
            await shop.update({
                vendorUsername: vendorUsername,
                vendorPassword: vendorPassword
            });
            console.log(`Generated vendor account for ${shop.name}: ${vendorUsername} / ${vendorPassword}`);
        } else {
            const updates = {};
            if (!shop.vendorUsername) updates.vendorUsername = user.username;
            if (!shop.vendorPassword) updates.vendorPassword = `${shop.slug}_pass2026`;
            if (Object.keys(updates).length > 0) {
                await shop.update(updates);
            }
        }
    } else {
        await User.destroy({ where: { ShopId: shop.id, role: 'vendor' } });
        await shop.update({
            vendorUsername: null,
            vendorPassword: null
        });
        console.log(`Deleted vendor account for shop ${shop.id}`);
    }
};

// Simple in-memory cache for shop list queries
const _cache = new Map();
const CACHE_TTL = 60_000; // 60 seconds
function cacheGet(key) {
    const entry = _cache.get(key);
    if (!entry || Date.now() - entry.ts > CACHE_TTL) return null;
    return entry.data;
}
function cacheSet(key, data) { _cache.set(key, { data, ts: Date.now() }); }
function cacheClear() { _cache.clear(); }

// Fisher-Yates over a copy. The copy matters: the array this runs on may be the
// one held in the cache, and shuffling that in place would reorder every later
// reader's view of it while they iterate.
function shuffled(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

exports.getAllShops = async (req, res) => {
    try {
        const { category, subcategory, search } = req.query;
        const cacheKey = `${category}|${subcategory}|${search}`;
        // Reshuffle on the way out. Shuffling before the cache write froze one
        // order for the whole 60s window, so every visitor in that window — and
        // every reload — saw the shops in the same sequence, which is the
        // opposite of what the ordering is for. The query stays cached; only
        // the order is recomputed, which is cheap.
        const cached = cacheGet(cacheKey);
        if (cached) return res.json({ success: true, data: shuffled(cached.data) });

        let whereClause = { isActive: true };
        if (search) {
            const isSqlite = sequelize.getDialect() === 'sqlite';
            const likeOp = isSqlite ? Op.like : Op.iLike;
            whereClause.name = { [likeOp]: `%${search}%` };
        }
        if (category) {
            if (isNaN(category)) {
                const foundCat = await Category.findOne({ where: { slug: category } });
                if (foundCat) {
                    whereClause.CategoryId = foundCat.id;
                } else {
                    whereClause.CategoryId = -1;
                }
            } else {
                whereClause.CategoryId = category;
            }
        }

        // Filter by subcategory at DB level — avoids sending all shops to the client
        const subCatInclude = { model: SubCategory, through: { attributes: [] } };
        if (subcategory) {
            subCatInclude.where = { id: subcategory };
            subCatInclude.required = true;
        }

        const shops = await Shop.findAll({
            where: whereClause,
            include: [
                subCatInclude,
                { model: Category, attributes: ['id', 'name', 'slug', 'icon'] },
                { model: ShopImage, attributes: ['id', 'url', 'order'] },
            ],
        });

        const plainShops = shops.map(shop => {
            const s = shop.toJSON();
            if (!s.latitude || !s.longitude) {
                // Generate deterministic coordinate in Tashkent based on shop ID
                const angle = (s.id * 0.987654) * 2 * Math.PI;
                // radius between 0.005 and 0.065 degrees (~0.5km to 7km)
                const radius = 0.005 + ((s.id * 17) % 100) * 0.0006;
                s.latitude = 41.311081 + radius * Math.sin(angle);
                s.longitude = 69.240562 + radius * Math.cos(angle);
                s.isMockCoords = true;
            }
            return s;
        });

        const result = { success: true, data: plainShops };
        if (!search) cacheSet(cacheKey, result); // don't cache search results
        res.json({ success: true, data: shuffled(plainShops) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getShopBySlug = async (req, res) => {
    try {
        const shop = await Shop.findOne({
            where: { slug: req.params.slug },
            include: shopIncludes
        });
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
        
        const shopJson = shop.toJSON();
        if (!shopJson.latitude || !shopJson.longitude) {
            const angle = (shopJson.id * 0.987654) * 2 * Math.PI;
            const radius = 0.005 + ((shopJson.id * 17) % 100) * 0.0006;
            shopJson.latitude = 41.311081 + radius * Math.sin(angle);
            shopJson.longitude = 69.240562 + radius * Math.cos(angle);
            shopJson.isMockCoords = true;
        }
        
        res.json({ success: true, data: shopJson });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getShopById = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id, { include: shopIncludes });
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
        
        const shopJson = shop.toJSON();
        if (!shopJson.latitude || !shopJson.longitude) {
            const angle = (shopJson.id * 0.987654) * 2 * Math.PI;
            const radius = 0.005 + ((shopJson.id * 17) % 100) * 0.0006;
            shopJson.latitude = 41.311081 + radius * Math.sin(angle);
            shopJson.longitude = 69.240562 + radius * Math.cos(angle);
            shopJson.isMockCoords = true;
        }
        
        res.json({ success: true, data: shopJson });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createShop = async (req, res) => {
    try {
        if (req.body.name && !req.body.slug) {
            req.body.slug = slugify(req.body.name);
        } else if (req.body.slug) {
            req.body.slug = slugify(req.body.slug);
        }

        const shop = await Shop.create(req.body);
        await recalculateShopRating(shop.id);

        const subCats = req.body.SubCategories || req.body.subCategoryIds;
        if (subCats && subCats.length) {
            await shop.setSubCategories(subCats);
        }

        await syncShopVendorAccount(shop, req.body.storeEnabled);

        cacheClear();
        const updatedShop = await Shop.findByPk(shop.id, { include: shopIncludes });
        res.json({ 
            success: true, 
            data: updatedShop
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateShop = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        if (req.body.slug) {
            req.body.slug = slugify(req.body.slug);
        } else if (req.body.name && !shop.slug) {
            req.body.slug = slugify(req.body.name);
        }

        await shop.update(req.body);
        await recalculateShopRating(shop.id);

        const subCats = req.body.SubCategories || req.body.subCategoryIds;
        if (subCats) {
            await shop.setSubCategories(subCats);
        }

        await syncShopVendorAccount(shop, req.body.storeEnabled);

        cacheClear();
        const updatedShop = await Shop.findByPk(shop.id, { include: shopIncludes });
        res.json({ success: true, data: updatedShop });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        await shop.destroy();
        cacheClear();
        res.json({ success: true, message: 'Shop deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Swap an existing gallery image's file in place, keeping its id and order.
// The admin's "re-crop" used to DELETE then POST, which loses the photo for
// good if the upload half fails. It could not simply be reordered, because
// addShopImage rejects a 4th image — during a replace the shop is still at its
// limit. Updating the row's url avoids both problems: the count never changes
// and there is no window where the image is missing.
exports.replaceShopImage = async (req, res) => {
    try {
        const image = await ShopImage.findOne({
            where: { id: req.params.imageId, ShopId: req.params.id }
        });
        if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const processedBuffer = await processGalleryImage(req.file.buffer);

        const fileUrl = await uploadBuffer(processedBuffer, 'houz_shops_gallery', req.file.originalname, 'image');
        // Only overwrite the url once the upload has actually succeeded.
        await image.update({ url: fileUrl });
        res.json({ success: true, data: image });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addShopImage = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        const count = await ShopImage.count({ where: { ShopId: req.params.id } });
        if (count >= 3) {
            return res.status(400).json({ success: false, message: 'Max 3 images per shop' });
        }

        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const processedBuffer = await processGalleryImage(req.file.buffer);

        try {
            const fileUrl = await uploadBuffer(processedBuffer, 'houz_shops_gallery', req.file.originalname, 'image');
            const image = await ShopImage.create({ url: fileUrl, order: count, ShopId: req.params.id });
            res.json({ success: true, data: image });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteShopImage = async (req, res) => {
    try {
        const image = await ShopImage.findOne({ where: { id: req.params.imageId, ShopId: req.params.id } });
        if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

        await image.destroy();

        const remaining = await ShopImage.findAll({ where: { ShopId: req.params.id }, order: [['order', 'ASC']] });
        for (let i = 0; i < remaining.length; i++) {
            await remaining[i].update({ order: i });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.reorderShopImages = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: 'ids must be an array' });
        }
        for (let i = 0; i < ids.length; i++) {
            await ShopImage.update({ order: i }, { where: { id: ids[i], ShopId: req.params.id } });
        }
        const images = await ShopImage.findAll({ where: { ShopId: req.params.id }, order: [['order', 'ASC']] });
        res.json({ success: true, data: images });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMyShopProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.ShopId) {
            return res.status(404).json({ success: false, message: 'Shop profile not found for this user' });
        }
        const shop = await Shop.findByPk(user.ShopId, { include: shopIncludes });
        res.json({ success: true, data: shop });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateMyShopProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.ShopId) {
            return res.status(404).json({ success: false, message: 'Shop profile not found for this user' });
        }
        const shop = await Shop.findByPk(user.ShopId);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        if (req.body.slug) {
            req.body.slug = slugify(req.body.slug);
        } else if (req.body.name && !shop.slug) {
            req.body.slug = slugify(req.body.name);
        }

        // Whitelist, because this route is reachable by any logged-in vendor for
        // their own shop. A blind shop.update(req.body) let a vendor set
        // isActive, featuredOrder, rating, vendorPassword or CategoryId on
        // themselves — CategoryId in particular is the FK the shops listing
        // filters on and the one the admin owns.
        const VENDOR_EDITABLE = [
            'name', 'name_ru', 'slug', 'description', 'description_ru',
            'location', 'locationLink', 'latitude', 'longitude',
            'website', 'instagram', 'telegram', 'phone',
            'logoUrl', 'bannerUrl', 'workingHours', 'currency',
            'tour360Url', 'customLinks', 'socialPlatform', 'socialUrl'
        ];
        const updates = {};
        for (const field of VENDOR_EDITABLE) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        }
        await shop.update(updates);

        // Subcategories a shop lists itself under. Restricted to the shop's own
        // category so a vendor cannot file themselves under someone else's.
        const subCats = req.body.SubCategories || req.body.subCategoryIds;
        if (Array.isArray(subCats)) {
            const allowed = await SubCategory.findAll({
                where: { id: subCats, CategoryId: shop.CategoryId },
                attributes: ['id']
            });
            await shop.setSubCategories(allowed.map(sc => sc.id));
        }

        await recalculateShopRating(shop.id);
        cacheClear();
        const updatedShop = await Shop.findByPk(shop.id, { include: shopIncludes });
        res.json({ success: true, data: updatedShop });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getShopReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { ShopId: req.params.id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createShopReview = async (req, res) => {
    try {
        const { authorName, comment, rating, phone } = req.body;
        if (!comment || rating === undefined) {
            return res.status(400).json({ success: false, message: 'Comment and rating are required' });
        }
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        // Normalize phone: keep only digits
        const digits = phone.replace(/\D/g, '');
        // Expect 998XXXXXXXXX (12 digits) or 9XXXXXXXX (9 digits)
        let normalizedPhone;
        if (digits.length === 12 && digits.startsWith('998')) {
            normalizedPhone = digits;
        } else if (digits.length === 9 && /^[0-9]{9}$/.test(digits)) {
            normalizedPhone = '998' + digits;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid phone number format. Use +998 XX XXX XX XX' });
        }

        const numericRating = parseInt(rating);
        if (numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // Prevent duplicate: one review per phone per shop
        const existing = await Review.findOne({
            where: { phone: normalizedPhone, ShopId: req.params.id }
        });
        if (existing) {
            return res.status(409).json({ success: false, message: 'DUPLICATE_PHONE' });
        }

        const review = await Review.create({
            authorName: authorName || 'Гость',
            phone: normalizedPhone,
            comment,
            rating: numericRating,
            ShopId: req.params.id
        });

        // Recalculate combined rating
        await recalculateShopRating(req.params.id);
        cacheClear();

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteShopReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        const shopId = review.ShopId;
        await review.destroy();
        if (shopId) {
            await recalculateShopRating(shopId);
            cacheClear();
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getUserLocationFromIp = async (req, res) => {
    try {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (ip && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        
        if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return res.json({ success: true, data: { latitude: 41.311081, longitude: 69.240562, ip: ip, isFallback: true } });
        }
        
        try {
            const geoRes = await fetch(`https://freeipapi.com/api/json/${ip}`);
            if (geoRes.ok) {
                const data = await geoRes.json();
                if (data && data.latitude && data.longitude) {
                    return res.json({
                        success: true,
                        data: {
                            latitude: parseFloat(data.latitude),
                            longitude: parseFloat(data.longitude),
                            ip: ip
                        }
                    });
                }
            }
        } catch (e) {
            console.error('freeipapi error:', e.message);
        }
        
        try {
            const geoRes2 = await fetch(`https://ipapi.co/${ip}/json/`);
            if (geoRes2.ok) {
                const data2 = await geoRes2.json();
                if (data2 && data2.latitude && data2.longitude) {
                    return res.json({
                        success: true,
                        data: {
                            latitude: parseFloat(data2.latitude),
                            longitude: parseFloat(data2.longitude),
                            ip: ip
                        }
                    });
                }
            }
        } catch (e) {
            console.error('ipapi error:', e.message);
        }
        
        res.json({ success: true, data: { latitude: 41.311081, longitude: 69.240562, ip: ip, isFallback: true } });
    } catch (err) {
        res.json({ success: true, data: { latitude: 41.311081, longitude: 69.240562, isFallback: true, message: err.message } });
    }
};

exports.getFeaturedShops = async (req, res) => {
    try {
        const shops = await Shop.findAll({
            where: { isActive: true, featuredOrder: { [Op.not]: null } },
            include: [{ model: Category, attributes: ['id', 'name', 'slug'] }],
            order: [['featuredOrder', 'ASC']],
            limit: 15
        });
        res.json({ success: true, data: shops });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const CATEGORY_FEATURED_LIMIT = 5;

// The pinned shops for one category. Scoped deliberately: updateFeaturedOrder
// resets every row because the site-wide list is global, but doing that here
// would clear all twelve categories' picks every time one was saved.
exports.getCategoryFeatured = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.categoryId, 10);
        if (!Number.isInteger(categoryId)) {
            return res.status(400).json({ success: false, message: 'Invalid category id' });
        }
        const shops = await Shop.findAll({
            where: { CategoryId: categoryId, categoryFeaturedOrder: { [Op.not]: null } },
            attributes: ['id', 'name', 'name_ru', 'slug', 'logoUrl', 'categoryFeaturedOrder'],
            order: [['categoryFeaturedOrder', 'ASC']],
            limit: CATEGORY_FEATURED_LIMIT
        });
        res.json({ success: true, data: shops });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateCategoryFeaturedOrder = async (req, res) => {
    try {
        const { categoryId, orders } = req.body;
        const catId = parseInt(categoryId, 10);
        if (!Number.isInteger(catId)) {
            return res.status(400).json({ success: false, message: 'categoryId is required' });
        }
        if (!Array.isArray(orders)) {
            return res.status(400).json({ success: false, message: 'orders must be an array' });
        }
        if (orders.length > CATEGORY_FEATURED_LIMIT) {
            return res.status(400).json({ success: false, message: `Maximum ${CATEGORY_FEATURED_LIMIT} shops per category` });
        }

        // Only shops that really belong to this category may be pinned in it —
        // otherwise a shop would carry a rank for a category it is not listed
        // under, and would surface in a screen it does not belong to.
        const ids = orders.map(o => parseInt(o.shopId, 10)).filter(Number.isInteger);
        const owned = await Shop.findAll({
            where: { id: ids, CategoryId: catId },
            attributes: ['id']
        });
        const ownedIds = new Set(owned.map(s => s.id));

        // Reject rather than skip. This is a whole-list replacement, so quietly
        // dropping an unrecognised id would clear the category's existing picks
        // and save a shorter list than the caller asked for.
        const foreign = ids.filter(id => !ownedIds.has(id));
        if (foreign.length || ids.length !== orders.length) {
            return res.status(400).json({
                success: false,
                message: 'Every shop must belong to this category',
                invalidShopIds: foreign
            });
        }

        await Shop.update(
            { categoryFeaturedOrder: null },
            { where: { CategoryId: catId } }
        );

        let rank = 1;
        for (const id of ids) {
            await Shop.update({ categoryFeaturedOrder: rank++ }, { where: { id } });
        }

        cacheClear();
        res.json({ success: true, data: { categoryId: catId, pinned: rank - 1 } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateFeaturedOrder = async (req, res) => {
    try {
        const { orders } = req.body; // [{ shopId: 1, order: 1 }, { shopId: 2, order: 2 }, ...]
        if (!Array.isArray(orders)) return res.status(400).json({ success: false, message: 'orders must be an array' });

        // Reset all
        await Shop.update({ featuredOrder: null }, { where: {} });

        // Set new orders
        for (const item of orders) {
            await Shop.update({ featuredOrder: item.order }, { where: { id: item.shopId } });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
