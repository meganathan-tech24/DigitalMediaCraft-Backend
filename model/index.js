const mongoose = require('mongoose');

const oauthUserSchema = require('./oauthUser.js');

const entities = {
	oauthUser: mongoose.model('oauthUser', oauthUserSchema, 'oauthUser')
};

module.exports = entities;
