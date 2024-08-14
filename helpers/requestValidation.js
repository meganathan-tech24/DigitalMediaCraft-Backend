module.exports = function (schema, isStrict = true, useNext = false) {

    return function (req, res, next) {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: !isStrict
        });

        const modelState = {
            error: error ? error.details : null,
            valid: !error
        };

        if (error) {
            if (useNext) {
                res.locals.modelState = modelState;
                res.locals.model = null;
                return next();
            } else {
                return res.status(400).json(modelState);
            }
        } else {
            res.locals.model = value;
            res.locals.modelState = modelState;
            return next();
        }
    };
};