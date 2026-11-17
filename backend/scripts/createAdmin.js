/**
 * Safe Admin Provisioning Script
 * Usage: node scripts/createAdmin.js [username] [email] [password]
 * Or configure via environment variables: ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const AdminUser = require('../models/AdminUser');

const provisionAdmin = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('Error: MONGO_URI is not defined in environment variables.');
        process.exit(1);
    }

    const username = process.argv[2] || process.env.ADMIN_USERNAME || 'admin';
    const email = process.argv[3] || process.env.ADMIN_EMAIL || 'admin@giakaa.com';
    const password = process.argv[4] || process.env.ADMIN_PASSWORD;

    if (!password) {
        console.error('Error: Admin password must be provided.');
        console.error('Usage: node scripts/createAdmin.js <username> <email> <password>');
        console.error('Or set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD in .env');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('Error: Password must be at least 8 characters long.');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);

        const existingUser = await AdminUser.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
        });

        if (existingUser) {
            console.log(`Admin user already exists with username '${existingUser.username}' or email '${existingUser.email}'.`);
            console.log('No modifications were made.');
            await mongoose.disconnect();
            process.exit(0);
        }

        const admin = new AdminUser({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            role: 'admin'
        });

        await admin.save();
        console.log(`Successfully provisioned admin user: ${admin.username} (${admin.email})`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Admin provisioning failed:', err.message);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
};

if (require.main === module) {
    provisionAdmin();
}

module.exports = provisionAdmin;
