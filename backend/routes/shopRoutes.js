const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const productController = require('../controllers/productController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

router.get('/featured', shopController.getFeaturedShops);
router.put('/featured/order', authMiddleware, adminOnly, shopController.updateFeaturedOrder);
router.get('/', shopController.getAllShops);
router.get('/my-location', shopController.getUserLocationFromIp);
router.get('/by-slug/:slug', shopController.getShopBySlug);
router.get('/profile', authMiddleware, shopController.getMyShopProfile);
router.put('/profile', authMiddleware, shopController.updateMyShopProfile);
router.get('/:id', shopController.getShopById);
router.post('/', authMiddleware, adminOnly, shopController.createShop);
router.put('/:id', authMiddleware, adminOnly, shopController.updateShop);
router.delete('/:id', authMiddleware, adminOnly, shopController.deleteShop);

// Shop reviews
router.get('/:id/reviews', shopController.getShopReviews);
router.post('/:id/reviews', shopController.createShopReview);
router.delete('/reviews/:reviewId', authMiddleware, adminOnly, shopController.deleteShopReview);

// Products under this shop
router.get('/:shopId/products', productController.getAllProducts);

router.post('/:id/images', authMiddleware, adminOnly, upload.single('image'), shopController.addShopImage);
router.put('/:id/images/:imageId', authMiddleware, adminOnly, upload.single('image'), shopController.replaceShopImage);
router.delete('/:id/images/:imageId', authMiddleware, adminOnly, shopController.deleteShopImage);
router.put('/:id/images/reorder', authMiddleware, adminOnly, shopController.reorderShopImages);

module.exports = router;
