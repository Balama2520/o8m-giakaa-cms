const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// @desc    Generate dynamic XML sitemap
// @route   GET /api/sitemap
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt');

    const baseUrl = 'http://localhost:5173'; // Should be production URL in real app

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Add home page
    xml += `<url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`;
    // Add blog listing
    xml += `<url><loc>${baseUrl}/blogs</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`;

    // Add dynamic blogs
    blogs.forEach(blog => {
      xml += `
            <url>
                <loc>${baseUrl}/blog/${blog.slug}</loc>
                <lastmod>${blog.updatedAt.toISOString().split('T')[0]}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.6</priority>
            </url>`;
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
