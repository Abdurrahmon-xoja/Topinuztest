const { SubCategory } = require('../models');

exports.getAllSubCategories = async (req, res) => {
    try {
        // ?category=<id> narrows the list to one category's subcategories.
        // Callers already sent this (the vendor dashboard's product form does),
        // but it was ignored, so every caller got all ~89 platform
        // subcategories and had to filter client-side — or didn't, and offered
        // other categories' subcategories by mistake.
        const where = {};
        const categoryId = parseInt(req.query.category, 10);
        if (Number.isInteger(categoryId)) where.CategoryId = categoryId;

        // Sort by order ascending, then name
        const subCats = await SubCategory.findAll({
            where,
            order: [
                ['order', 'ASC'],
                ['name', 'ASC']
            ]
        });
        res.json({ success: true, data: subCats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createSubCategory = async (req, res) => {
    try {
        const subCat = await SubCategory.create(req.body);
        res.json({ success: true, data: subCat });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateSubCategory = async (req, res) => {
    try {
        const subCat = await SubCategory.findByPk(req.params.id);
        if (!subCat) return res.status(404).json({ success: false, message: 'SubCategory not found' });
        await subCat.update(req.body);
        res.json({ success: true, data: subCat });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteSubCategory = async (req, res) => {
    try {
        const subCat = await SubCategory.findByPk(req.params.id);
        if (!subCat) return res.status(404).json({ success: false, message: 'SubCategory not found' });
        await subCat.destroy();
        res.json({ success: true, message: 'SubCategory deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.reorderSubcategories = async (req, res) => {
    try {
        const items = req.body; // Expecting array of {id, order}
        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Expected array of items' });
        }

        // To make it efficient and safe, we can update in a loop or bulk.
        // For SQLite simplicity, a loop with Promises is fine for small numbers.
        await Promise.all(items.map(item => {
            return SubCategory.update({ order: item.order }, { where: { id: item.id } });
        }));

        res.json({ success: true, message: 'Order updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
