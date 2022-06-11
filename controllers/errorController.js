const AppErrors = require('../utils/appErrors');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}!`
    return new AppErrors(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value: ${err.keyValue.name}. Plaase use different value!`;
    return new AppErrors(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data! ${errors.join('. ')}`;
    return new AppErrors(message, 400);
}

const sendErrorDev = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } 
    console.error(err);
    return res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: err.message
    }); 
}

const sendErorrProd = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        if(err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        return res.status(500).json({
            status: 'error',
            message: "Big error!"
        });
    } 
    if(err.isOperational) {
        return res.status(err.statusCode).render("error", {
            title: "Something went wrong!",
            msg: err.message
        }); 
    }
    console.error(err);
    res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: "Please try again later!"
    }); 
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production'){
        let error = { ...err };
        if(err.name === 'CastError') error = handleCastErrorDB(error);
        if(err.code === 11000) error = handleDuplicateFieldsDB(error);
        if(err.name === 'ValidationError') error = handleValidationErrorDB(error);

        sendErorrProd(error, req, res);
    }
    // next();
}