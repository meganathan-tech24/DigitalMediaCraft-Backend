const methods = {};

const crypto = require('crypto');

const databaseModel = require('../model/index.js');

methods.hashPassword = function (password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
};

methods.generateSalt = function () {
    return crypto.randomBytes(16).toString('hex');
};

// Utility function to fetch a user's Facebook page connection
methods.getSocialMedia = async (userId, type) => {
    try {
        return await databaseModel.mediaConnection.findOne({ type, userId }).lean();
    } catch (error) {
        console.error(`Error fetching Facebook page connection for user ${userId}:`, error.message);
        throw new Error('Failed to fetch Facebook page connection');
    }
};
    
module.exports = methods;