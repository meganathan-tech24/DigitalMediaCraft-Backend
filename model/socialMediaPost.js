const { Schema } = require('mongoose');

const socialMediaPostSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'oauthUser', required: true },
    status: String,
    message: String,
    files: [String],
    pageId: String,
    pageName: String,
    pageProfile: String,
    externalLink: String,
    externalPostId: String,
}, { timestamps: true });

module.exports = socialMediaPostSchema;
