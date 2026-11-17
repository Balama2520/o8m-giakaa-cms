const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { app } = require('../server');
const { signToken } = require('../utils/auth');

test('Authentication & Route Protection Suite', async (t) => {
    await t.test('POST /api/auth/login requires username and password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({});

        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
        assert.match(res.body.error, /Please provide both username and password/i);
    });

    await t.test('Admin APIs reject requests without token with 401', async () => {
        const endpoints = [
            { method: 'get', path: '/api/admin/blogs' },
            { method: 'post', path: '/api/admin/blogs' },
            { method: 'put', path: '/api/admin/blogs/60d0fe4f5311236168a109ca' },
            { method: 'delete', path: '/api/admin/blogs/60d0fe4f5311236168a109ca' },
            { method: 'get', path: '/api/admin/hero' },
            { method: 'post', path: '/api/admin/hero' },
            { method: 'put', path: '/api/admin/hero/1' },
            { method: 'delete', path: '/api/admin/hero/1' },
        ];

        for (const ep of endpoints) {
            const res = await request(app)[ep.method](ep.path);
            assert.strictEqual(res.status, 401, `Expected 401 for ${ep.method.toUpperCase()} ${ep.path}`);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.error, /Authentication required/i);
        }
    });

    await t.test('Mutating public routes reject unauthenticated requests with 401', async () => {
        const mutatingRoutes = [
            { method: 'post', path: '/api/blogs', data: { title: 'Test', content: 'Test' } },
            { method: 'put', path: '/api/blogs/60d0fe4f5311236168a109ca', data: { title: 'Test' } },
            { method: 'delete', path: '/api/blogs/60d0fe4f5311236168a109ca' },
            { method: 'post', path: '/api/hero', data: { title: 'Hero' } },
            { method: 'put', path: '/api/hero/1', data: { title: 'Hero' } },
            { method: 'delete', path: '/api/hero/1' },
        ];

        for (const ep of mutatingRoutes) {
            const req = request(app)[ep.method](ep.path);
            if (ep.data) req.send(ep.data);
            const res = await req;
            assert.strictEqual(res.status, 401, `Expected 401 for unauthenticated mutation ${ep.method.toUpperCase()} ${ep.path}`);
            assert.strictEqual(res.body.success, false);
        }
    });

    await t.test('Admin APIs reject invalid tokens with 401', async () => {
        const res = await request(app)
            .get('/api/admin/blogs')
            .set('Authorization', 'Bearer invalid-token-string');

        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.success, false);
        assert.match(res.body.error, /Invalid authentication token/i);
    });

    await t.test('Admin APIs reject expired tokens with 401', async () => {
        const expiredToken = signToken({ id: 'test_user', role: 'admin' }, '0s');

        const res = await request(app)
            .get('/api/admin/blogs')
            .set('Authorization', `Bearer ${expiredToken}`);

        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.success, false);
        assert.match(res.body.error, /Token has expired/i);
    });

    await t.test('Admin APIs reject non-admin users with 403', async () => {
        // Mock non-admin middleware scenario
        const { requireAdmin } = require('../middleware/auth');
        let forbidden = false;
        const mockReq = { user: { role: 'viewer', username: 'guest' } };
        const mockRes = {
            status: (code) => {
                if (code === 403) forbidden = true;
                return { json: (data) => data };
            }
        };
        requireAdmin(mockReq, mockRes, () => {});
        assert.strictEqual(forbidden, true, 'Expected 403 for non-admin user role');
    });
});
