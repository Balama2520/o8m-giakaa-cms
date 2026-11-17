const { verifyToken } = require('../utils/auth');
const AdminUser = require('../models/AdminUser');

const requireAuth = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required. No token provided.'
            });
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token has expired. Please log in again.'
                });
            }
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication token.'
            });
        }

        // Verify that the user still exists in the database
        const user = await AdminUser.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'The account associated with this token no longer exists.'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication middleware error:', err);
        return res.status(500).json({
            success: false,
            error: 'Authentication service error'
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Administrative privileges required.'
        });
    }
    next();
};

module.exports = {
    requireAuth,
    requireAdmin
};
