const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectMongoDB = require('./config/mongodb');
const { connectPostgres, sequelize } = require('./config/postgres');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
        : process.env.NODE_ENV !== 'production',
    credentials: true
}));

app.get('/health', async (_req, res) => {
    try {
        await Promise.all([mongoose.connection.db.admin().ping(), sequelize.authenticate()]);
        res.status(200).json({
            status: 'ok',
            dependencies: { mongodb: 'connected', postgresql: 'connected' }
        });
    } catch (err) {
        console.error('Health check failed:', err.message);
        res.status(503).json({
            status: 'degraded',
            dependencies: {
                mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                postgresql: 'unknown'
            }
        });
    }
});

app.use('/api/hero', require('./routes/heroRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/sitemap', require('./routes/sitemapRoutes'));

app.use((err, _req, res, _next) => {
    console.error('Unhandled request error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
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
};

startServer().catch((err) => {
    console.error('Application startup failed:', err);
    process.exit(1);
});
