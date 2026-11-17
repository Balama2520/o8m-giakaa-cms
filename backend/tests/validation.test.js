const test = require('node:test');
const assert = require('node:assert');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const { isSafeUrl } = require('../utils/validators');

test('Data Sanitization & Validation Suite', async (t) => {
    await t.test('sanitizeHtml strips malicious scripts and event handlers', () => {
        const dirty = '<p>Normal text</p><script>alert("pwned")</script><img src="https://example.com/pic.jpg" onerror="alert(1)">';
        const clean = sanitizeHtml(dirty, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span', 'div']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                '*': ['style', 'class'],
                'img': ['src', 'alt']
            }
        });

        assert.strictEqual(clean.includes('<script>'), false);
        assert.strictEqual(clean.includes('onerror'), false);
        assert.strictEqual(clean.includes('Normal text'), true);
        assert.strictEqual(clean.includes('https://example.com/pic.jpg'), true);
    });

    await t.test('slugify produces valid URL slugs', () => {
        const title = 'Scaling Distributed Systems in 2026: A Deep-Dive!';
        const slug = slugify(title, { lower: true, strict: true });
        assert.strictEqual(slug, 'scaling-distributed-systems-in-2026-a-deep-dive');
    });

    await t.test('mongoose.isValidObjectId correctly validates MongoDB IDs', () => {
        assert.strictEqual(mongoose.isValidObjectId('60d0fe4f5311236168a109ca'), true);
        assert.strictEqual(mongoose.isValidObjectId('invalid-id-string'), false);
        assert.strictEqual(mongoose.isValidObjectId('12345'), false);
        assert.strictEqual(mongoose.isValidObjectId(''), false);
        assert.strictEqual(mongoose.isValidObjectId(null), false);
    });

    await t.test('isSafeUrl rejects javascript: and data: links for CTA and media', () => {
        assert.strictEqual(isSafeUrl('javascript:void(0)'), false);
        assert.strictEqual(isSafeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), false);
        assert.strictEqual(isSafeUrl('https://giakaa.com/contact'), true);
        assert.strictEqual(isSafeUrl('#consultation'), true);
    });

    await t.test('field allowlist discards injected or privileged attributes', () => {
        const rawBody = {
            title: 'Valid Title',
            content: '<p>Body</p>',
            role: 'superadmin',
            isAdmin: true,
            unknownMaliciousField: 'exploit'
        };

        const blogAllowlist = ['title', 'content', 'metaTitle', 'metaDescription', 'featuredImage', 'status'];
        const filtered = Object.fromEntries(
            blogAllowlist
                .filter((k) => Object.prototype.hasOwnProperty.call(rawBody, k))
                .map((k) => [k, rawBody[k]])
        );

        assert.strictEqual(filtered.title, 'Valid Title');
        assert.strictEqual(filtered.content, '<p>Body</p>');
        assert.strictEqual(filtered.role, undefined);
        assert.strictEqual(filtered.isAdmin, undefined);
        assert.strictEqual(filtered.unknownMaliciousField, undefined);
    });
});
