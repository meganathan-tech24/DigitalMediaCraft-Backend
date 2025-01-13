const { Schema } = require('mongoose');

const socialMediaPostSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'oauthUser', required: true },
    status: String,
    title: String,
    description: String,
    files: [String]
}, { timestamps: true });

module.exports = socialMediaPostSchema;
