const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
    console.error(err); // Log the error for debugging

    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong, try again later',
    };

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(', ');
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    // Mongoose duplicate key error
    if (err.code && err.code === 11000) {
        customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    // Mongoose cast error (invalid ID format)
    if (err.name === 'CastError') {
        customError.msg = `No item found with id: ${err.value}`;
        customError.statusCode = StatusCodes.NOT_FOUND;
    }

    return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
