const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be defined in production environment');
    }
    return secret || 'o8m-giakaa-cms-development-secret-key-change-in-production';
};

const signToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '8h') => {
    return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

const verifyToken = (token) => {
    return jwt.verify(token, getJwtSecret());
};

module.exports = {
    signToken,
    verifyToken
};
