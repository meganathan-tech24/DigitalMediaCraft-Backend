const methods = {};

const crypto = require('crypto');

methods.hashPassword = function (password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
};

methods.generateSalt = function () {
    return crypto.randomBytes(16).toString('hex');
};
    
module.exports = methods;