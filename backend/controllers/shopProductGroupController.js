const { Shop, User, Product, ShopProductGroup } = require('../models');
const slugify = require('../utils/slugify');

// Every handler here resolves the shop from the caller's own User.ShopId and
// never from a URL parameter, so a vendor can only ever reach their own groups.
const resolveShop = async (req) => {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.ShopId) return null;
    return Shop.findByPk(user.ShopId);
};

exports.getMyGroups = async (req, res) => {
    try {
        const shop = await resolveShop(req);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop profile not found for this user' });

        const groups = await ShopProductGroup.findAll({
            where: { ShopId: shop.id },
            order: [['order', 'ASC'], ['name', 'ASC']]
        });
        res.json({ success: true, data: groups });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createMyGroup = async (req, res) => {
    try {
        const shop = await resolveShop(req);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop profile not found for this user' });

        const name = (req.body.name || '').trim();
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const count = await ShopProductGroup.count({ where: { ShopId: shop.id } });
        if (count >= 30) {
            return res.status(400).json({ success: false, message: 'Maximum 30 groups per shop' });
        }

        const group = await ShopProductGroup.create({
            ShopId: shop.id,
            name,
            name_ru: (req.body.name_ru || '').trim() || null,
            slug: slugify(name),
            order: Number.isInteger(req.body.order) ? req.body.order : count
        });
        res.json({ success: true, data: group });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateMyGroup = async (req, res) => {
    try {
        const shop = await resolveShop(req);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop profile not found for this user' });

        const group = await ShopProductGroup.findOne({
            where: { id: req.params.groupId, ShopId: shop.id }
        });
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        const updates = {};
        if (typeof req.body.name === 'string' && req.body.name.trim()) {
            updates.name = req.body.name.trim();
            updates.slug = slugify(updates.name);
        }
        if (typeof req.body.name_ru === 'string') updates.name_ru = req.body.name_ru.trim() || null;
        if (Number.isInteger(req.body.order)) updates.order = req.body.order;

        await group.update(updates);
        res.json({ success: true, data: group });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteMyGroup = async (req, res) => {
    try {
        const shop = await resolveShop(req);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop profile not found for this user' });

        const group = await ShopProductGroup.findOne({
            where: { id: req.params.groupId, ShopId: shop.id }
        });
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        // Unassign rather than cascade: deleting a grouping must never delete
        // the products filed under it.
        await Product.update(
            { ShopProductGroupId: null },
            { where: { ShopProductGroupId: group.id } }
        );
        await group.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Accepts { order: [id, id, ...] } and writes the array index as each group's
// order, so the storefront pill bar follows the owner's arrangement.
exports.reorderMyGroups = async (req, res) => {
    try {
        const shop = await resolveShop(req);
        if (!shop) return res.status(404).json({ success: false, message: 'Shop profile not found for this user' });

        const ids = Array.isArray(req.body.order) ? req.body.order : null;
        if (!ids) return res.status(400).json({ success: false, message: 'order must be an array of ids' });

        const owned = await ShopProductGroup.findAll({
            where: { id: ids, ShopId: shop.id },
            attributes: ['id']
        });
        const ownedIds = new Set(owned.map(g => g.id));

        await Promise.all(
            ids
                .filter(id => ownedIds.has(id))
                .map((id, idx) => ShopProductGroup.update({ order: idx }, { where: { id } }))
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
