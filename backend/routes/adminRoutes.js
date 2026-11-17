const express = require('express');
const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');
const Blog = require('../models/Blog');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { isSafeUrl } = require('../utils/validators');

// Protect all /api/admin routes with authentication and admin authorization
router.use(requireAuth);
router.use(requireAdmin);

// Sanitization configuration matching model specification
const sanitizeContent = (dirty) => {
    if (!dirty) return '';
    return sanitizeHtml(dirty, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span', 'div']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            '*': ['style', 'class'],
            'img': ['src', 'alt']
        }
    });
};

/* ==========================================================================
   ADMIN HERO SLIDES MANAGEMENT (/api/admin/hero)
   ========================================================================== */

const heroAllowlist = [
    'title',
    'description',
    'mediaUrl',
    'ctaText',
    'ctaLink',
    'displayOrder',
    'isActive'
];

const filterHeroBody = (body) => {
    const filtered = {};
    for (const key of heroAllowlist) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            filtered[key] = body[key];
        }
    }
    return filtered;
};

// @desc    Get all hero slides (active & inactive)
// @route   GET /api/admin/hero
router.get('/hero', async (_req, res) => {
    try {
        const slides = await HeroSlide.findAll({
            order: [['display_order', 'ASC']]
        });
        res.status(200).json({ success: true, data: slides });
    } catch (err) {
        console.error('Admin hero fetch error:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve hero slides' });
    }
});

// @desc    Create a hero slide
// @route   POST /api/admin/hero
router.post('/hero', async (req, res) => {
    try {
        const payload = filterHeroBody(req.body);

        if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
            return res.status(400).json({ success: false, error: 'Slide title is required' });
        }

        if (payload.mediaUrl && !isSafeUrl(payload.mediaUrl)) {
            return res.status(400).json({ success: false, error: 'Invalid or unsafe media URL' });
        }

        if (payload.ctaLink && !isSafeUrl(payload.ctaLink)) {
            return res.status(400).json({ success: false, error: 'Invalid or unsafe CTA link URL' });
        }

        if (payload.displayOrder !== undefined) {
            payload.displayOrder = parseInt(payload.displayOrder, 10) || 0;
        }

        if (payload.isActive !== undefined) {
            payload.isActive = Boolean(payload.isActive);
        }

        const slide = await HeroSlide.create(payload);
        res.status(201).json({ success: true, data: slide });
    } catch (err) {
        console.error('Admin hero create error:', err);
        res.status(400).json({ success: false, error: err.message || 'Failed to create slide' });
    }
});

// @desc    Update a hero slide
// @route   PUT /api/admin/hero/:id
router.put('/hero/:id', async (req, res) => {
    try {
        const slide = await HeroSlide.findByPk(req.params.id);
        if (!slide) {
            return res.status(404).json({ success: false, error: 'Slide not found' });
        }

        const payload = filterHeroBody(req.body);

        if (payload.title !== undefined && (typeof payload.title !== 'string' || payload.title.trim() === '')) {
            return res.status(400).json({ success: false, error: 'Title cannot be empty' });
        }

        if (payload.mediaUrl !== undefined && !isSafeUrl(payload.mediaUrl)) {
            return res.status(400).json({ success: false, error: 'Invalid or unsafe media URL' });
        }

        if (payload.ctaLink !== undefined && !isSafeUrl(payload.ctaLink)) {
            return res.status(400).json({ success: false, error: 'Invalid or unsafe CTA link URL' });
        }

        if (payload.displayOrder !== undefined) {
            payload.displayOrder = parseInt(payload.displayOrder, 10) || 0;
        }

        if (payload.isActive !== undefined) {
            payload.isActive = Boolean(payload.isActive);
        }

        await slide.update(payload);
        res.status(200).json({ success: true, data: slide });
    } catch (err) {
        console.error('Admin hero update error:', err);
        res.status(400).json({ success: false, error: err.message || 'Failed to update slide' });
    }
});

// @desc    Delete a hero slide
// @route   DELETE /api/admin/hero/:id
router.delete('/hero/:id', async (req, res) => {
    try {
        const slide = await HeroSlide.findByPk(req.params.id);
        if (!slide) {
            return res.status(404).json({ success: false, error: 'Slide not found' });
        }
        await slide.destroy();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error('Admin hero delete error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete hero slide' });
    }
});

/* ==========================================================================
   ADMIN BLOGS MANAGEMENT (/api/admin/blogs)
   ========================================================================== */

const blogAllowlist = [
    'title',
    'content',
    'metaTitle',
    'metaDescription',
    'featuredImage',
    'status'
];

const filterBlogBody = (body) => {
    const filtered = {};
    for (const key of blogAllowlist) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            filtered[key] = body[key];
        }
    }
    return filtered;
};

// @desc    Get all blogs (published & drafts)
// @route   GET /api/admin/blogs
router.get('/blogs', async (_req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: blogs });
    } catch (err) {
        console.error('Admin blogs fetch error:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve blogs' });
    }
});

// @desc    Create a blog post
// @route   POST /api/admin/blogs
router.post('/blogs', async (req, res) => {
    try {
        const payload = filterBlogBody(req.body);

        if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        if (!payload.content || typeof payload.content !== 'string' || payload.content.trim() === '') {
            return res.status(400).json({ success: false, error: 'Content is required' });
        }

        if (payload.status && !['draft', 'published'].includes(payload.status)) {
            return res.status(400).json({ success: false, error: 'Status must be draft or published' });
        }

        if (payload.featuredImage && !isSafeUrl(payload.featuredImage)) {
            return res.status(400).json({ success: false, error: 'Invalid or unsafe featured image URL' });
        }

        // Sanitization executed explicitly
        payload.content = sanitizeContent(payload.content);

        const blog = await Blog.create(payload);
        res.status(201).json({ success: true, data: blog });
    } catch (err) {
        console.error('Admin blog create error:', err);
        res.status(400).json({ success: false, error: err.message || 'Failed to create blog' });
    }
});

// @desc    Update a blog post
// @route   PUT /api/admin/blogs/:id
router.put('/blogs/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid blog ID' });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        const payload = filterBlogBody(req.body);

        if (payload.title !== undefined && (typeof payload.title !== 'string' || payload.title.trim() === '')) {
            return res.status(400).json({ success: false, error: 'Title cannot be empty' });
        }

        if (payload.content !== undefined && (typeof payload.content !== 'string' || payload.content.trim() === '')) {
            return res.status(400).json({ success: false, error: 'Content cannot be empty' });
        }

        if (payload.status !== undefined && !['draft', 'published'].includes(payload.status)) {
            return res.status(400).json({ success: false, error: 'Status must be draft or published' });
        }

        if (payload.featuredImage !== undefined && !isSafeUrl(payload.featuredImage)) {
            return res.status(400).json({ success: false, error: 'Invalid or unsafe featured image URL' });
        }

        // Explicit sanitization of rich-text content on update
        if (payload.content) {
            payload.content = sanitizeContent(payload.content);
        }

        Object.assign(blog, payload);
        // blog.save() triggers pre('save') hook which re-slugifies if title was modified
        await blog.save();

        res.status(200).json({ success: true, data: blog });
    } catch (err) {
        console.error('Admin blog update error:', err);
        res.status(400).json({ success: false, error: err.message || 'Failed to update blog' });
    }
});

// @desc    Delete a blog post
// @route   DELETE /api/admin/blogs/:id
router.delete('/blogs/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid blog ID' });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        await blog.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error('Admin blog delete error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete blog' });
    }
});

module.exports = router;
