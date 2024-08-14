const _ = require('lodash');
const xss = require('xss');

const xssOptions = {
    whiteList: {
        // Define your whitelist here if needed
        // img: ['src', 'alt', 'width'],
    },
    stripIgnoreTag: true,
};

function xssMiddleware(req, res, next) {
        req.body = sanitize(req.body);
        req.query = sanitize(req.query);
        req.params = sanitize(req.params);

    next();
}

function sanitize(value) {
    if (_.isArray(value)) {
        return value.map(sanitize);
    } else if (_.isObject(value)) {
        return _.mapValues(value, sanitize);
    } else if (_.isString(value)) {
        return xss(value, xssOptions);
    } else {
        return value;
    }
}

module.exports = { xssMiddleware };
