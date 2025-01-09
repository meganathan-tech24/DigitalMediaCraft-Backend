const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const context = require('../model');
require('dotenv').config();

class OAuth {
    constructor(options) {
        // Allow instantiation without the 'new' keyword
        if (!(this instanceof OAuth)) {
            return new OAuth(options);
        }

        this.config = {};

        // Attach models from context
        this.config.models = context;
    }
}

/**
 * Middleware to authorize requests using OAuth.
 * Validates the JWT token and ensures the user exists in the database.
 */
OAuth.prototype.authorize = async function (req, res, next) {
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
        return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    // Extract and validate the token
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    // Decode the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId || !mongoose.isObjectIdOrHexString(decoded.userId)) {
        return res.status(400).json({ status: false, message: 'Invalid token.' });
    }

    // Check if the user exists in the database
    const oauthUser = await this.config.models.oauthUser.findById(decoded.userId).lean();
    if (!oauthUser) {
        return res.status(400).json({ status: false, message: 'Invalid token.' });
    }

    // Check token expiration
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return res.status(400).json({ status: false, message: 'Token expired.' });
    }

    // Attach user to response locals for downstream access
    res.locals.user = oauthUser;

    // Proceed to the next middleware
    return next();
};


module.exports = OAuth;
