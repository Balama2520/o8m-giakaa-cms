import axios from 'axios';
import { getToken, clearAuth } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach bearer token when available
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401s on admin endpoints
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isAuthRoute = error.config.url.includes('/auth/login');
            if (!isAuthRoute && error.config.url.includes('/admin')) {
                clearAuth();
                // Custom event to trigger re-render in auth components
                window.dispatchEvent(new Event('auth:unauthorized'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
