const Joi = require('joi');

module.exports = function (schema, isStrict = true, useNext = false) {
    return function (req, res, next) {
        const model = Joi.validate(req.body, schema, { abortEarly: false, allowUnknown: !isStrict });
        if (model.error) {
            const modelState = {
                error: model.error.details,
                valid: false
            };

            if (useNext) {
                res.locals.modelState = modelState;
                res.locals.model = null;
                return next();
            }
            else
                return res.status(400).json(modelState);
        }
        else {
            res.locals.model = model.value;
            res.locals.modelState = {
                valid: true
            };
            return next();
        }
    };
};