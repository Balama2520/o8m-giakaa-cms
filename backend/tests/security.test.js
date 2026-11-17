const test = require('node:test');
const assert = require('node:assert');
const { isSafeUrl } = require('../utils/validators');
const { signToken, verifyToken } = require('../utils/auth');

test('isSafeUrl validator', async (t) => {
    await t.test('allows standard http and https URLs', () => {
        assert.strictEqual(isSafeUrl('https://example.com/image.jpg'), true);
        assert.strictEqual(isSafeUrl('http://example.com/banner.png'), true);
        assert.strictEqual(isSafeUrl('https://images.unsplash.com/photo-123?w=800'), true);
    });

    await t.test('allows relative paths and empty/hash anchors', () => {
        assert.strictEqual(isSafeUrl('/services'), true);
        assert.strictEqual(isSafeUrl('/blog/ai-future'), true);
        assert.strictEqual(isSafeUrl('#'), true);
        assert.strictEqual(isSafeUrl(''), true);
        assert.strictEqual(isSafeUrl(null), true);
    });

    await t.test('rejects dangerous script schemes', () => {
        assert.strictEqual(isSafeUrl('javascript:alert(1)'), false);
        assert.strictEqual(isSafeUrl('JavaScript:alert(document.cookie)'), false);
        assert.strictEqual(isSafeUrl('data:text/html,<script>alert(1)</script>'), false);
        assert.strictEqual(isSafeUrl('vbscript:msgbox("xss")'), false);
        assert.strictEqual(isSafeUrl('file:///etc/passwd'), false);
    });

    await t.test('rejects malformed URLs', () => {
        assert.strictEqual(isSafeUrl('not a valid url at all'), false);
        assert.strictEqual(isSafeUrl('//protocol-relative-without-domain'), false);
    });
});

test('JWT auth utilities', async (t) => {
    await t.test('generates and verifies valid token', () => {
        const payload = { id: '60d0fe4f5311236168a109ca', username: 'admin', role: 'admin' };
        const token = signToken(payload, '1h');
        assert.ok(token);
        assert.strictEqual(typeof token, 'string');

        const decoded = verifyToken(token);
        assert.strictEqual(decoded.id, payload.id);
        assert.strictEqual(decoded.username, payload.username);
        assert.strictEqual(decoded.role, payload.role);
    });

    await t.test('rejects invalid or tampered tokens', () => {
        assert.throws(() => {
            verifyToken('invalid.token.signature');
        });
    });

    await t.test('rejects expired tokens', () => {
        const payload = { id: 'test_user', role: 'admin' };
        // Create token with 0ms lifespan
        const token = signToken(payload, '0s');
        assert.throws(() => {
            verifyToken(token);
        }, (err) => err.name === 'TokenExpiredError');
    });
});
