const mongoose = require('mongoose');

const mediaConnectionSchema = require('./mediaConnection.js');
const oauthUserSchema = require('./oauthUser.js');
const socialMediaPostSchema = require('./socialMediaPost.js');
const collectorSchema = require('./collector.js');

const entities = {
	oauthUser: mongoose.model('oauthUser', oauthUserSchema, 'oauthUser'),
	mediaConnection: mongoose.model('mediaConnection', mediaConnectionSchema, 'mediaConnection'),
	socialMediaPost: mongoose.model('socialMediaPost', socialMediaPostSchema, 'socialMediaPost'),
	collector: mongoose.model('collector', collectorSchema, 'collector'),
};

module.exports = entities;
