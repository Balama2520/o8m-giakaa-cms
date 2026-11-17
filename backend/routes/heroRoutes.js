const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');

// Public endpoint: inactive slides must never be exposed.
router.get('/', async (req, res) => {
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

// NOTE: These mutation routes still require authentication middleware before production use.
router.post('/', async (req, res) => {
    try {
        const slide = await HeroSlide.create(req.body);
        res.status(201).json({ success: true, data: slide });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const slide = await HeroSlide.findByPk(req.params.id);
        if (!slide) {
            return res.status(404).json({ success: false, error: 'Slide not found' });
        }
        await slide.update(req.body);
        res.status(200).json({ success: true, data: slide });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
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
