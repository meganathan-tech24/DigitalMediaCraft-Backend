const { Schema } = require('mongoose');

const oauthUserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: { type: String, index: true },
    phone: { type: String, index: true },
    hash: String,
    salt: String,
    isBlocked: { type: Boolean, default: false },
    attemptCount: { type: Number, default: 0 },
    loginCount: { type: Number, default: 0 },
    ips: [String],
    loginStatus: { type: Boolean, default: false },
    lastLogin: Date,
}, { timestamps: true });

module.exports = oauthUserSchema;
