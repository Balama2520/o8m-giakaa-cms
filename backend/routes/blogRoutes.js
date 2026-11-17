const express = require('express');
const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const router = express.Router();
const Blog = require('../models/Blog');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { isSafeUrl } = require('../utils/validators');

const editableFields = [
    'title',
    'content',
    'metaTitle',
    'metaDescription',
    'featuredImage',
    'status'
];

const pickEditableFields = (body) => Object.fromEntries(
    editableFields
        .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
        .map((field) => [field, body[field]])
);

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

// Public listing: strictly published articles only
router.get('/', async (_req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: blogs });
    } catch (err) {
        console.error('Failed to list published blogs:', err);
        res.status(500).json({ success: false, error: 'Unable to retrieve blogs' });
    }
});

// Public detail: strictly published articles only
router.get('/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }
        res.status(200).json({ success: true, data: blog });
    } catch (err) {
        console.error('Failed to retrieve blog:', err);
        res.status(500).json({ success: false, error: 'Unable to retrieve blog' });
    }
});

// Mutating endpoints require authentication and admin authorization
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const payload = pickEditableFields(req.body);

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

        payload.content = sanitizeContent(payload.content);
        const blog = await Blog.create(payload);
        res.status(201).json({ success: true, data: blog });
    } catch (err) {
        console.error('Failed to create blog:', err);
        res.status(400).json({ success: false, error: err.message || 'Unable to create blog' });
    }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid blog ID' });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        const payload = pickEditableFields(req.body);

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

        if (payload.content) {
            payload.content = sanitizeContent(payload.content);
        }

        Object.assign(blog, payload);
        // blog.save() triggers pre('save') to update slug if title changed
        await blog.save();

        res.status(200).json({ success: true, data: blog });
    } catch (err) {
        console.error('Failed to update blog:', err);
        res.status(400).json({ success: false, error: err.message || 'Unable to update blog' });
    }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
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
        console.error('Failed to delete blog:', err);
        res.status(500).json({ success: false, error: 'Unable to delete blog' });
    }
});

module.exports = router;
