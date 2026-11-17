const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const sequelize = databaseUrl
    ? new Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: process.env.NODE_ENV === 'production'
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    })
    : new Sequelize(
        process.env.POSTGRES_DB,
        process.env.POSTGRES_USER,
        process.env.POSTGRES_PASSWORD,
        {
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT || 5432,
            dialect: 'postgres',
            logging: false,
            pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
        }
    );

const connectPostgres = async () => {
    await sequelize.authenticate();
    console.log('PostgreSQL connected');

    if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync();
        console.log('PostgreSQL models synchronized');
    }
};

module.exports = { sequelize, connectPostgres };
