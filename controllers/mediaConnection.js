const querystring = require('querystring');

const axios = require('axios');
const express = require('express');
const _ = require('lodash');

const router = express.Router();
const joiSchema = require('../helpers/joiSchema.js');
const validate = require('../helpers/requestValidation.js');
const databaseModel = require('../model/index.js');

require('dotenv').config();
const methods = {};

methods.getMediaConnection = async (req, res) => {

    const user = res.locals.user;

    const mediaConnections = await databaseModel.mediaConnection.find({ userId: user._id }, { type: 1, accounts: 1 }).lean();

    const data = mediaConnections?.length ? _.keyBy(mediaConnections, 'type') : {};

    return res.status(200).json({ status: true, data: data });
};

methods.addMediaConnection = async (req, res) => {

    const request = res.locals.model;
    const { _id: userId } = res.locals.user;

    const isFound = await databaseModel.mediaConnection.exists({ userId: userId, type: request.type });
    if (isFound) return res.status(400).json({ status: false, message: 'Connection already exists' });

    const data = {
        ...request,
        userId: userId
    };

    await databaseModel.mediaConnection.create(data);
    return res.status(200).json({ status: true, message: 'Channel has been successfully connected.' });
};

methods.deleteMediaConnection = async (req, res) => {

    const { type } = res.locals.model;
    const { _id: userId } = res.locals.user;

    const isFound = await databaseModel.mediaConnection.exists({ userId: userId, type: type });

    if (!isFound) return res.status(404).json({ status: false, message: 'Connection not found' });

    await databaseModel.mediaConnection.deleteOne({ userId: userId, type: type });

    return res.status(200).json({ status: true, message: 'Channel has been successfully disconnected.' });
};

methods['facebook_page_media'] = async (token) => {

    if (!token) {
        return { status: false, message: 'Token is required' };
    }

    const exchange = {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        grant_type: 'fb_exchange_token',
        fb_exchange_token: token
    };

    const exchangeUrl = process.env.FACEBOOK_GRAPH_API + '/oauth/access_token?' + querystring.stringify(exchange);

    const exchangeResult = await axios.get(exchangeUrl);

    console.log('exchangeResult', JSON.stringify(exchangeResult.data));

    const accessToken = _.get(exchangeResult, 'data.access_token');

    if (!accessToken) {
        return { status: false, message: 'Invalid token' };
    }

    return { status: true, accessToken };
};

methods.exchange = async (req, res) => {
    try {
        const { type } = req.params;
        const { token } = req.body;

        if (typeof methods[type] === 'function') {
            const result = await methods[type](token);
            return res.status(200).json(result);
        }

        return res.status(400).json({ status: false, message: 'Invalid request type' });
    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

router.get('/', methods.getMediaConnection);
router.post('/connect', validate(joiSchema.addMediaConnection), methods.addMediaConnection);
router.delete('/disconnect', validate(joiSchema.deleteMediaConnection), methods.deleteMediaConnection);
router.post('/:type', validate(joiSchema.exchange), methods.exchange);

module.exports.methods = methods;
module.exports.router = router;