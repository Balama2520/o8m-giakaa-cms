const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// @desc    Get all blogs
// @route   GET /api/blogs
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const blogs = await Blog.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: blogs });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
router.get('/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }
        res.status(200).json({ success: true, data: blog });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Create a blog
// @route   POST /api/blogs
router.post('/', async (req, res) => {
    try {
        const blog = await Blog.create(req.body);
        res.status(201).json({ success: true, data: blog });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Update a blog
// @route   PUT /api/blogs/:id
router.put('/:id', async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        // Slug is updated automatically by model pre-save hook based on title
        blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: blog });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
router.delete('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }
        await blog.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
