const express = require('express');
const _ = require('lodash');

const router = express.Router();
const joiSchema = require('../helpers/joiSchema.js');
const validate = require('../helpers/requestValidation.js');
const databaseModel = require('../model/index.js');


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

router.get('/', methods.getMediaConnection);
router.post('/connect', validate(joiSchema.addMediaConnection), methods.addMediaConnection);
router.delete('/disconnect', validate(joiSchema.deleteMediaConnection), methods.deleteMediaConnection);

module.exports.methods = methods;
module.exports.router = router;