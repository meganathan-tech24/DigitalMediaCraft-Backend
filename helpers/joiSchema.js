const joi = require('joi');
const { times } = require('lodash');
const { token } = require('morgan');

const methods = {};

const mediaTypes = ['facebook_page_media'];

// OAuth User Controller Joi Schema

methods.signup = joi.object().keys({
    email: joi.string().email().required().lowercase().trim(),
    password: joi.string().min(6).required(),
    firstName: joi.string().required(),
    lastName: joi.string().required()
});

methods.signIn = joi.object().keys({
    email: joi.string().email().required().lowercase().trim(),
    password: joi.string().min(6).required()
});

// Media Connection Controller Joi Schema

methods.addMediaConnection = joi.object().keys({
    type: joi.string().valid(...mediaTypes).required(),
    accounts: joi.array(),
    user: joi.object()
});

methods.deleteMediaConnection = joi.object().keys({
    type: joi.string().valid(...mediaTypes).required()
});

methods.exchange = joi.object().keys({
    token: joi.string().required(),
});

// Post Management Controller Joi Schema

methods.createPost = joi.object().keys({
    pageId: joi.string().required(),
    pageName: joi.string().required(),
    pageProfile: joi.string().required(),
    files: joi.array().items(joi.string()).required(),
    message: joi.string().required(),
    status: joi.string().valid('drafted', 'published', 'scheduled').required(),
});

methods.statusChange = joi.object().keys({
    postId: joi.string().required(),
    status: joi.string().valid('published', 'scheduled').required(),
    scheduledAt: joi.string().optional(),
});

module.exports = methods;