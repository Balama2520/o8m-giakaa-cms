const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const connectMongoDB = require('./config/mongodb');
const { connectPostgres, sequelize } = require('./config/postgres');

dotenv.config();

const app = express();

// Security headers
app.use(helmet({
    contentSecurityPolicy: false // Allow rich content and client assets
}));

// Body parser with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS configuration with allowlist
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://o8m-giakaa-cms.vercel.app'
    ];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        return callback(new Error('Cross-Origin Request Blocked by CORS Policy'));
    },
    credentials: true
}));

// Health check endpoint
const checkHealth = async (_req, res) => {
    try {
        const [mongoPing] = await Promise.all([
            mongoose.connection.db ? mongoose.connection.db.admin().ping() : Promise.reject(new Error('MongoDB not initialized')),
            sequelize.authenticate()
        ]);

        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            dependencies: {
                mongodb: mongoPing ? 'connected' : 'degraded',
                postgresql: 'connected'
            }
        });
    } catch (err) {
        console.error('Health check failed:', err.message);
        res.status(503).json({
            status: 'degraded',
            timestamp: new Date().toISOString(),
            dependencies: {
                mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                postgresql: 'disconnected'
            }
        });
    }
};

app.get('/health', checkHealth);
app.get('/api/health', checkHealth);

// Public API routes
app.use('/api/hero', require('./routes/heroRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Administrative API routes (all authenticated)
app.use('/api/admin', require('./routes/adminRoutes'));

// Discovery sitemap routes (supports both /sitemap.xml and /api/sitemap)
app.use('/sitemap.xml', require('./routes/sitemapRoutes'));
app.use('/api/sitemap', require('./routes/sitemapRoutes'));

// Global error handling middleware - never leaks internal database traces to client
app.use((err, _req, res, _next) => {
    console.error('Unhandled request error:', err);
    const statusCode = err.status || err.statusCode || 500;
    const isDev = process.env.NODE_ENV !== 'production';

    res.status(statusCode).json({
        success: false,
        error: isDev ? err.message : 'Internal server error'
    });
});

const startServer = async () => {
    await Promise.all([connectMongoDB(), connectPostgres()]);
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
    });

    const shutdown = async (signal) => {
        console.log(`${signal} received; shutting down`);
        server.close(async () => {
            await Promise.allSettled([mongoose.disconnect(), sequelize.close()]);
            process.exit(0);
        });
    };

    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
    return server;
};

if (require.main === module) {
    startServer().catch((err) => {
        console.error('Application startup failed:', err);
        process.exit(1);
    });
}

module.exports = { app, startServer };
