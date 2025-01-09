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

        res.locals.modelState = modelState;
        res.locals.model = error ? null : value;

        if (error && !useNext) {
            return res.status(400).json({
                status: false,
                message: 'Invalid request',
                ...modelState,
            });
        }

        return next();

    };
};