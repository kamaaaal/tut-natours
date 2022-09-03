const ApiError = require('../utils/apiError');

function errorInDevelopment(err, res) {
    err.statusCode = err.statusCode || 500;
    console.log('error in development');
    console.log(err);
    /// we just send all information to the res body for easy debigging
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    });
}

function productionError(err, res) {
    err.statusCode = err.statusCode || 500;

    // console.error(err);
    // console.log('its aproduction time error');

    /// if the err is opertional than it should be thrown by us and it will have a user
    /// user understandable message in it
    /// so we can just send that message in response
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    /// but if its not an operational error then we cant expose our bugs to the user
    /// so we just send a generalized internal server error
    else {
        res.status(err.statusCode).json({
            status: err.status,
            message: 'Internal Server Error',
        });
    }
}

/// handle cast error returns a formetted operationalError
const handleDBCastError = (err) => {
    const message = `invalid value  ${err.value} for property ${err.path}`;
    return new ApiError(message, 400); // 400 is for bad request
};

/// duplicate key error
const handleDuplicateKeyError = (err) => {
    console.log('\n \t duplicate key error', err);
    const message = `duplicat value on field : ${Object.keys(err.keyValue)}`;
    return new ApiError(message, 400);
};

/// handleDBValidationError

const handleDBValidationError = (err) => {
    // all the validation errors where in this field
    const validationError = err.errors;
    console.log(validationError);
    console.log('object keyes', Object.keys(validationError));
    // errors property holds an object with properties of the field where we made error
    /// and those properties has the  message field. so we have to loop through and get that message field
    const messages = Object.keys(validationError).map(
        (propKey) => String(validationError[propKey].message)
        // a dummy object with empty message property
    );
    const message = messages.join('. ,');
    return new ApiError(message, 400);
};

/// global error handler which will be used by expressss
exports.globalErrorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        // in production mode we dont need to send our programming error's to the user

        // handling unhandled errors to be operational error so taking a copy of our err object argument
        let error = null

        //// handling  cast err from database
        if (err.name === 'CastError') {
            error = handleDBCastError(err);
        }
        /// handling duplicate value error with its error code
        else if (err.code === 11000) {
            error = handleDuplicateKeyError(err);
        } else if (err.name === 'ValidationError') {
            console.log('itsanvalidationError');

            error = handleDBValidationError(err);
        }

        productionError(error || err, res);
    } else if (process.env.NODE_ENV === 'development') {
        // in development we need lot of information to debugg our code
        errorInDevelopment(err, res);
    }
};
