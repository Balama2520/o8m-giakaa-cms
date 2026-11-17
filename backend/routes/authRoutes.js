const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const AdminUser = require('../models/AdminUser');
const { signToken } = require('../utils/auth');
const { requireAuth } = require('../middleware/auth');

// Brute-force protection: max 5 login requests per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 attempts per 15m window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many login attempts from this IP. Please try again after 15 minutes.'
    }
});

// @desc    Admin login
// @route   POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide both username and password'
            });
        }

        const normalizedIdentifier = String(username).trim().toLowerCase();

        // Support login by either username or email
        const user = await AdminUser.findOne({
            $or: [
                { username: normalizedIdentifier },
                { email: normalizedIdentifier }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const isMatch = await user.comparePassword(String(password));
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = signToken({
            id: user._id,
            username: user.username,
            role: user.role
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            error: 'Authentication failed due to server error'
        });
    }
});

// @desc    Get current logged in admin
// @route   GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// @desc    Logout admin
// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
