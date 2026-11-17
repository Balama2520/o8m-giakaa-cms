const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { isSafeUrl } = require('../utils/validators');

// Public endpoint: only active slides are visible to visitors
router.get('/', async (_req, res) => {
    try {
        const slides = await HeroSlide.findAll({
            where: { isActive: true },
            order: [['display_order', 'ASC']]
        });
        res.status(200).json({ success: true, data: slides });
    } catch (err) {
        console.error('Failed to retrieve hero slides:', err);
        res.status(500).json({ success: false, error: 'Unable to retrieve hero slides' });
    }
});

// Mutating endpoints require authentication and admin privileges
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { title, description, mediaUrl, ctaText, ctaLink, displayOrder, isActive } = req.body;

        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        if (mediaUrl && !isSafeUrl(mediaUrl)) {
            return res.status(400).json({ success: false, error: 'Invalid or unsafe media URL' });
        }

        if (ctaLink && !isSafeUrl(ctaLink)) {
            return res.status(400).json({ success: false, error: 'Invalid or unsafe CTA link URL' });
        }

        const slide = await HeroSlide.create({
            title: title.trim(),
            description,
            mediaUrl,
            ctaText,
            ctaLink,
            displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : 0,
            isActive: isActive !== undefined ? Boolean(isActive) : true
        });

        res.status(201).json({ success: true, data: slide });
    } catch (err) {
        console.error('Failed to create hero slide:', err);
        res.status(400).json({ success: false, error: err.message || 'Unable to create hero slide' });
    }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const slide = await HeroSlide.findByPk(req.params.id);
        if (!slide) {
            return res.status(404).json({ success: false, error: 'Slide not found' });
        }

        const { title, description, mediaUrl, ctaText, ctaLink, displayOrder, isActive } = req.body;

        if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
            return res.status(400).json({ success: false, error: 'Title cannot be empty' });
        }

        if (mediaUrl !== undefined && !isSafeUrl(mediaUrl)) {
            return res.status(400).json({ success: false, error: 'Invalid or unsafe media URL' });
        }

        if (ctaLink !== undefined && !isSafeUrl(ctaLink)) {
            return res.status(400).json({ success: false, error: 'Invalid or unsafe CTA link URL' });
        }

        const updates = {};
        if (title !== undefined) updates.title = title.trim();
        if (description !== undefined) updates.description = description;
        if (mediaUrl !== undefined) updates.mediaUrl = mediaUrl;
        if (ctaText !== undefined) updates.ctaText = ctaText;
        if (ctaLink !== undefined) updates.ctaLink = ctaLink;
        if (displayOrder !== undefined) updates.displayOrder = parseInt(displayOrder, 10) || 0;
        if (isActive !== undefined) updates.isActive = Boolean(isActive);

        await slide.update(updates);
        res.status(200).json({ success: true, data: slide });
    } catch (err) {
        console.error('Failed to update hero slide:', err);
        res.status(400).json({ success: false, error: err.message || 'Unable to update hero slide' });
    }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const slide = await HeroSlide.findByPk(req.params.id);
        if (!slide) {
            return res.status(404).json({ success: false, error: 'Slide not found' });
        }
        await slide.destroy();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error('Failed to delete hero slide:', err);
        res.status(500).json({ success: false, error: 'Unable to delete hero slide' });
    }
});

module.exports = router;
