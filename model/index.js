const mongoose = require('mongoose');

const mediaConnectionSchema = require('./mediaConnection.js');
const oauthUserSchema = require('./oauthUser.js');

const entities = {
	oauthUser: mongoose.model('oauthUser', oauthUserSchema, 'oauthUser'),
	mediaConnection: mongoose.model('mediaConnection', mediaConnectionSchema, 'mediaConnection')
};

module.exports = entities;
