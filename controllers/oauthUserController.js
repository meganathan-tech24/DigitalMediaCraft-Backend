const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const commonHelper = require('../helpers/common.js');
const joiSchema = require('../helpers/joiSchema.js');
const requestValidation = require('../helpers/requestValidation.js');
const databaseModel = require('../model/index.js');
const methods = {};
require('dotenv').config();

methods.signUp = async (req, res) => {

    const formattedEmail = commonHelper.emailToLowerCase(req.body.email);

    const userExists = await databaseModel.oauthUser.findOne({ email: formattedEmail });
    if (userExists) {
        return res.status(400).json({ status: false, message: 'Account with this email already exists. Please log in or use a different email.' });
    }

    const salt = commonHelper.generateSalt();
    const hash = commonHelper.hashPassword(req.body.password, salt);

    const model = {
        email: formattedEmail,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        salt: salt,
        hash: hash,
    };

    await databaseModel.oauthUser.create(model);

    return res.status(200).json({ status: true, message: 'Account created successfully. You can now log in.' });
};

router.post('/signup', requestValidation(joiSchema.signup), methods.signUp);

methods.signIn = async (req, res) => {

    const { email, password } = req.body;
    const formattedEmail = commonHelper.emailToLowerCase(email);

    const user = await databaseModel.oauthUser.findOne({ email: formattedEmail }).lean();
    if (!user) return res.status(400).json({ status: false, message: 'No account found with the provided email address.' });

    const hash = commonHelper.hashPassword(password, user.salt);
    if (hash !== user.hash) {
        return res.status(400).json({ status: false, message: 'Incorrect password. Please try again.' });
    }

    const payload = { email: user.email, userId: user._id };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({ status: true, message: 'Login successful', data: { accessToken, refreshToken } });
};

router.post('/sign-in', requestValidation(joiSchema.signIn), methods.signIn);

module.exports.methods = methods;
module.exports.router = router;