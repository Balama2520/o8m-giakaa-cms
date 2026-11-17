const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { app } = require('../server');

test('System Health & Security Headers Suite', async (t) => {
    await t.test('GET /health returns health report structure', async () => {
        const res = await request(app).get('/health');
        assert.ok([200, 503].includes(res.status), `Expected 200 or 503, got ${res.status}`);
        assert.ok(res.body.status, 'Response must contain status field');
        assert.ok(res.body.dependencies, 'Response must list dependencies');
        assert.ok(['connected', 'degraded', 'disconnected'].includes(res.body.dependencies.mongodb));
        assert.ok(['connected', 'disconnected', 'unknown'].includes(res.body.dependencies.postgresql));
    });

    await t.test('GET /api/health responds with identical health schema', async () => {
        const res = await request(app).get('/api/health');
        assert.ok([200, 503].includes(res.status));
        assert.ok(res.body.status);
        assert.ok(res.body.dependencies);
    });

    await t.test('Helmet security headers are active on HTTP responses', async () => {
        const res = await request(app).get('/health');
        assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
        assert.ok(res.headers['x-dns-prefetch-control']);
    });
});
