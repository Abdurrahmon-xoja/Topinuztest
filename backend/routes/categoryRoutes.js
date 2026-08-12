const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', categoryController.getAllCategories);
router.post('/', authMiddleware, adminOnly, categoryController.createCategory);
router.put('/:id', authMiddleware, adminOnly, categoryController.updateCategory);
// deleteCategory cascades to every Shop, SubCategory and Product in the category
// (categoryController.js:32-47), so this one especially must not be vendor-reachable.
router.delete('/:id', authMiddleware, adminOnly, categoryController.deleteCategory);

module.exports = router;
