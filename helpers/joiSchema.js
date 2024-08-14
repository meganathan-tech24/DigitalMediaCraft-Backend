const joi = require('joi');

const methods = {};

methods.signup = joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    firstName: joi.string().required(),
    lastName: joi.string().required()
});

module.exports = methods;