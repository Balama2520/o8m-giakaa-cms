import { describe, it, expect, beforeEach } from 'vitest';
import { getToken, setToken, getUser, setUser, clearAuth, isAuthenticated } from '../utils/auth';

describe('Frontend Auth Utilities', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('manages tokens correctly in localStorage', () => {
        expect(getToken()).toBeNull();
        setToken('test-jwt-token-123');
        expect(getToken()).toBe('test-jwt-token-123');
        clearAuth();
        expect(getToken()).toBeNull();
    });

    it('manages user objects in localStorage', () => {
        expect(getUser()).toBeNull();
        const userObj = { id: 'u1', username: 'admin', role: 'admin' };
        setUser(userObj);
        expect(getUser()).toEqual(userObj);
        clearAuth();
        expect(getUser()).toBeNull();
    });

    it('evaluates isAuthenticated based on token presence and expiration', () => {
        expect(isAuthenticated()).toBe(false);

        // Valid mock token (exp far in the future: year 2030)
        const futureExp = Math.floor(Date.now() / 1000) + 3600;
        const validPayload = btoa(JSON.stringify({ id: 'u1', exp: futureExp }));
        const validToken = `header.${validPayload}.signature`;

        setToken(validToken);
        expect(isAuthenticated()).toBe(true);

        // Expired mock token (exp in the past)
        const pastExp = Math.floor(Date.now() / 1000) - 3600;
        const expiredPayload = btoa(JSON.stringify({ id: 'u1', exp: pastExp }));
        const expiredToken = `header.${expiredPayload}.signature`;

        setToken(expiredToken);
        expect(isAuthenticated()).toBe(false);
    });
});
