const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const HeroSlide = sequelize.define('HeroSlide', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    mediaUrl: {
        type: DataTypes.STRING(500),
        field: 'media_url'
    },
    ctaText: {
        type: DataTypes.STRING(100),
        defaultValue: 'Learn More',
        field: 'cta_text'
    },
    ctaLink: {
        type: DataTypes.STRING(500),
        defaultValue: '#',
        field: 'cta_link'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'display_order'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'hero_slides',
    timestamps: true,
    underscored: true
});

module.exports = HeroSlide;
