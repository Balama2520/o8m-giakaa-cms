const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');

// @desc    Get all hero slides
// @route   GET /api/hero
router.get('/', async (req, res) => {
    try {
        const slides = await HeroSlide.findAll({
            order: [['display_order', 'ASC']]
        });
        res.status(200).json({ success: true, data: slides });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Create a hero slide
// @route   POST /api/hero
router.post('/', async (req, res) => {
    try {
        const slide = await HeroSlide.create(req.body);
        res.status(201).json({ success: true, data: slide });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Update a hero slide
// @route   PUT /api/hero/:id
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

// @desc    Delete a hero slide
// @route   DELETE /api/hero/:id
router.delete('/:id', async (req, res) => {
    try {
        const slide = await HeroSlide.findByPk(req.params.id);
        if (!slide) {
            return res.status(404).json({ success: false, error: 'Slide not found' });
        }
        await slide.destroy();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
