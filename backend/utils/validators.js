/**
 * Validates whether a given URL is safe and does not execute scripts.
 * Rejects javascript:, data:, vbscript:, and control characters.
 */
const isSafeUrl = (url, allowEmpty = true) => {
    if (!url || typeof url !== 'string') {
        return allowEmpty;
    }

    const trimmed = url.trim();
    if (trimmed === '' || trimmed === '#' || trimmed.startsWith('#')) {
        return allowEmpty || trimmed.startsWith('#');
    }

    // Relative URLs starting with '/' are permitted (disallowing protocol-relative //)
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
        return true;
    }

    // Dangerous schemes check (case-insensitive)
    const dangerousSchemes = /^(javascript|data|vbscript|file):/i;
    if (dangerousSchemes.test(trimmed)) {
        return false;
    }

    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

module.exports = {
    isSafeUrl
};
