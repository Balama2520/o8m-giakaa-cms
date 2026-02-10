const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.POSTGRES_HOST,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectPostgres = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connected...'.blue.underline.bold);
        // Sync models
        await sequelize.sync();
        console.log('PostgreSQL Models Synced'.blue);
    } catch (err) {
        console.error('PostgreSQL Connection Error:', err.message);
    }
};

module.exports = { sequelize, connectPostgres };
