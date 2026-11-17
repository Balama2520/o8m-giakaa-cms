const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminUserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please provide a username'],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters']
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
                'Please provide a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password must be at least 8 characters']
        },
        role: {
            type: String,
            enum: ['admin'],
            default: 'admin'
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
AdminUserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with hashed password in database
AdminUserSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Never expose password hash in JSON responses
AdminUserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('AdminUser', AdminUserSchema);
