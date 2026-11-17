const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// XML special character escaping helper
const escapeXml = (unsafe) => {
    return String(unsafe).replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

// @desc    Generate dynamic XML sitemap
// @route   GET /sitemap.xml and GET /api/sitemap
router.get('/', async (_req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt');
        const baseUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://o8m-giakaa-cms.vercel.app').replace(/\/+$/, '');

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Core routes
        xml += `  <url>\n    <loc>${escapeXml(baseUrl)}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
        xml += `  <url>\n    <loc>${escapeXml(baseUrl)}/blogs</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

        // Published blog routes
        blogs.forEach((blog) => {
            const lastMod = blog.updatedAt ? blog.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            xml += `  <url>\n    <loc>${escapeXml(baseUrl)}/blog/${escapeXml(blog.slug)}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);
    } catch (err) {
        console.error('Failed to generate sitemap:', err);
        res.status(500).json({ success: false, error: 'Unable to generate sitemap' });
    }
});

module.exports = router;
