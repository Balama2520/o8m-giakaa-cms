const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Blog = require('../models/Blog');

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

// Public listing: never allow a query parameter to expose drafts.
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: blogs });
    } catch (err) {
        console.error('Failed to list published blogs:', err);
        res.status(500).json({ success: false, error: 'Unable to retrieve blogs' });
    }
});

// Public detail: only published articles are addressable.
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

// NOTE: These mutation routes still require authentication middleware before production use.
router.post('/', async (req, res) => {
    try {
        const blog = await Blog.create(pickEditableFields(req.body));
        res.status(201).json({ success: true, data: blog });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid blog ID' });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        Object.assign(blog, pickEditableFields(req.body));
        await blog.save();

        res.status(200).json({ success: true, data: blog });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
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
