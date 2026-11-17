const TOKEN_KEY = 'giakaa_cms_admin_token';
const USER_KEY = 'giakaa_cms_admin_user';

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
};

export const getUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setUser = (user) => {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_KEY);
    }
};

export const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    // Check basic JWT structure and client-side expiration
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return false;
        const decoded = JSON.parse(atob(payloadBase64));
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            clearAuth();
            return false;
        }
        return true;
    } catch {
        clearAuth();
        return false;
    }
};
