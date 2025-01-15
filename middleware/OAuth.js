const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const databaseModel = require('../model');
require('dotenv').config();

class OAuth {
    constructor(options) {
        // Allow instantiation without the 'new' keyword
        if (!(this instanceof OAuth)) {
            return new OAuth(options);
        }

        this.config = { models: databaseModel };
    }
}

/**
 * Middleware to authorize requests using OAuth.
 * Validates the JWT token and ensures the user exists in the database.
 */
OAuth.prototype.authorize = async function (req, res, next) {

    try {
        // Handle CORS preflight requests
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            return res.end();
        }

        // Extract the Authorization header
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.toLowerCase().startsWith('bearer')) {
            return res.status(401).json({ status: false, message: 'Unauthorized', error: 'invalid_token' });
        }

        // Extract the token from the Authorization header
        const token = authHeader.split(' ')[1];
        if (!token || token === 'null') {
            return res.status(401).json({ status: false, message: 'Unauthorized', error: 'invalid_token' });
        }

        // Decode and verify the token using JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.userId || !mongoose.isObjectIdOrHexString(decoded.userId)) {
            return res.status(400).json({ status: false, message: 'Invalid token.', error: 'invalid_token' });
        }

        // Validate the decoded token structure
        if (!decoded?.userId || !mongoose.isObjectIdOrHexString(decoded.userId)) {
            return res.status(400).json({ status: false, message: 'Invalid token.', error: 'invalid_token' });
        }

        // Check if the user exists in the database
        const oauthUser = await this.config.models.oauthUser.findById(decoded.userId).lean();
        if (!oauthUser) {
            return res.status(400).json({ status: false, message: 'User not found.', error: 'invalid_token' });
        }

        // Check token expiration
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
            return res.status(400).json({ status: false, message: 'Token expired.', error: 'invalid_token' });
        }

        // Attach the user to response locals for downstream access
        res.locals.user = oauthUser;

        // Proceed to the next middleware
        return next();
    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({ status: false, message: 'Internal server error.', error: 'invalid_token' });
    }
};


module.exports = OAuth;
