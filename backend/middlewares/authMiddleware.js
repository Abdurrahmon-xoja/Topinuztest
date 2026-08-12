const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

// authMiddleware only proves the token is valid, not who it belongs to. Vendor
// tokens carry role 'vendor' (authController.js:29), so without this check any
// vendor could create, edit or delete any shop, category or subcategory —
// including other vendors'. Routes that act on an arbitrary :id, or on the
// shared taxonomy, must sit behind this. A vendor's own shop is edited through
// /api/shops/profile, which stays on authMiddleware alone.
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

module.exports = {
    authMiddleware,
    adminOnly,
    JWT_SECRET
};
