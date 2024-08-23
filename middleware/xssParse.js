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

    if (Array.isArray(value)) {
        return value.map(sanitize);
    } else if (typeof value === 'object') {
        const sanitized = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                sanitized[key] = (_.isBoolean(value[key]) || _.isNumber(value[key]) || _.isNull(value[key])) ? value[key] : sanitize(value[key]);
            }
        }
        return sanitized;
    } else {
        return (_.isBoolean(value) || _.isNumber(value)) ? value : xss(value, xssOptions);
    }
}

module.exports = { xssMiddleware };
