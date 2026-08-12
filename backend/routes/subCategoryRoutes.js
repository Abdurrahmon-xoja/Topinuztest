const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', subCategoryController.getAllSubCategories);
router.post('/', authMiddleware, adminOnly, subCategoryController.createSubCategory);
router.put('/reorder', authMiddleware, adminOnly, subCategoryController.reorderSubcategories);
router.put('/:id', authMiddleware, adminOnly, subCategoryController.updateSubCategory);
router.delete('/:id', authMiddleware, adminOnly, subCategoryController.deleteSubCategory);

module.exports = router;
