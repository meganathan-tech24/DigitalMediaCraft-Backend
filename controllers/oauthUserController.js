const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const commonHelper = require('../helpers/common.js');
const joiSchema = require('../helpers/joiSchema.js');
const validate = require('../helpers/requestValidation.js');
const databaseModel = require('../model/index.js');

const methods = {};
require('dotenv').config();

methods.signUp = async (req, res) => {

    const { email, password, firstName, lastName } = res.locals.model;

    const userExists = await databaseModel.oauthUser.exists({ email: email });
    if (userExists) {
        return res.status(400).json({ status: false, message: 'An account with this email already exists. Please log in or use a different email to register.' });
    }

    const salt = commonHelper.generateSalt();
    const hash = commonHelper.hashPassword(password, salt);

    const model = { email, firstName, lastName, salt, hash };

    await databaseModel.oauthUser.create(model);

    return res.status(200).json({ status: true, message: 'Account created successfully. You can now log in.' });
};

methods.signIn = async (req, res) => {

    const { email, password } = res.locals.model;

    const user = await databaseModel.oauthUser.findOne({ email: email }).lean();
    if (!user) return res.status(400).json({ status: false, message: 'Account not found. Please check your email and try again.' });

    const hash = commonHelper.hashPassword(password, user.salt);
    if (hash !== user.hash) {
        return res.status(400).json({ status: false, message: 'Invalid password. Please try again.' });
    }

    const payload = { email: user.email, userId: user._id };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({ status: true, message: 'Login successful', data: { accessToken, refreshToken } });
};

router.post('/sign-in', validate(joiSchema.signIn), methods.signIn);
router.post('/signup', validate(joiSchema.signup), methods.signUp);

module.exports.methods = methods;
module.exports.router = router;