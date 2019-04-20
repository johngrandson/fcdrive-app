const mongoose = require('../../database');
const bcrypt = require('bcryptjs');
const mongoObjectId = require('../../utils/objectIdGenerator');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: [true, "User email is required"],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "User password is required"],
        select: false
    },
    repository: {
        type: String,
        default: null,
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: [true, "User need to have a role"]
    },
    createdAt: {
        type: Date,
        defaul: Date.now
    }
});

const randomObjectId = mongoObjectId();

UserSchema.pre('save', async function (next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    this.repository = (`container-${randomObjectId}`).toLowerCase();
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;