const { Schema } = require('mongoose');

const mediaConnectionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'oauthUser', required: true },
    type: {
        type: String,
        required: true,
        enum: ['facebook_page_media'],
    },
    accounts: Array,
    user: Object,
}, { timestamps: true });

module.exports = mediaConnectionSchema;
