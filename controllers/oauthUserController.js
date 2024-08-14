const express = require('express');

const router = express.Router();
const commonHelper = require('../helpers/common.js');
const joiSchema = require('../helpers/joiSchema.js');
const requestValidation = require('../helpers/requestValidation.js');
const databaseModel = require('../model/index.js');
const methods = {};

// New sign-up method
methods.signUp = async (req, res) => {

    const email = req.body.email.trim().toLowerCase();

    // Check if user already exists
    const userExists = await databaseModel.oauthUser.findOne({ email: email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const model = {
        email: email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    };

    const salt = commonHelper.generateSalt();
    model.salt = salt;
    model.hash = commonHelper.hashPassword(req.body.password, salt);

    await databaseModel.oauthUser.create(model);

    return res.json({ message: 'User signed up' });
};

router.post('/signup', requestValidation(joiSchema.signup), methods.signUp);

module.exports.methods = methods;
module.exports.router = router;