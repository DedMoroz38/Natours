const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appErrors");
const Email = require("../utils/email");

const signToken = id => {
    return jwt.sign({ 
            id: id 
            }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    
    res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true, //no way to be modified by the browser
        secure:  req.secure || req.headers["x-forwarded-proto"] === 'https'
    });

    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        login: req.body.login,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role,
        active: req.body.active
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    let {login, password} = req.body;
    if(!login || !password) {
        return next(new AppError("Please provide login and password!", 400));
    }

    const user = await User.findOne({ login }).select("+password");
    if(!user || !(await user.checkPassword(password, user.password))){
        return next(new AppError("Incorrect email or password!", 401));
    }
    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', "loggedOut", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    }); 
    res.status(200).json({ status: "success" });
}

exports.protect = catchAsync( async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if(!token){
        return next(new AppError("You are not logged in!", 401));
    }
    //Checks is user wasn't deleted
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError('The user with this token is not longer exist!', 401));
    }
    //Check if password wasn't changed
    if(currentUser.changedPassowrdAfter(decoded.iat)){
        return next(new AppError('User changed his password. Please log in again!', 401));
    }
    res.locals.user = currentUser;
    req.user = currentUser;
    next();
});

exports.isLoggedIn =  async (req, res, next) => {
    if (req.cookies.jwt) {
        try{
            // 1) verify token 
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );
            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if(!currentUser) {
                return next();
            }
            // 3) Check if password wasn't changed
            if(currentUser.changedPassowrdAfter(decoded.iat)){
                return next();
            }
            //There is a logged in user
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)){
            return next( new AppError("You do not have permission to perform this action!", 403))
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("There is no user with this email address.", 404));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    
    try{
        const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswrodReset();
    
        res.status(200).json({
            status: "success",
            message: "Token sent to email!"
        });  
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error with sending email. Try again later!', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });
    if(!user){
        return next(new AppError("Token is invalid or has expired", 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    if(!(await user.checkPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError("Your current password is wrong.", 401));
    }

    user.password = req.body.password;
    user.passwordConfirm= req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, req, res);
});