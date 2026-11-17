import '@testing-library/jest-dom';

// Standard localStorage mock for JSDOM and Vitest environments
const storage = {};
const localStorageMock = {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => { storage[key] = String(value); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
});

if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true
    });
}
