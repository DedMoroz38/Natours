const express = require('express');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const path = require("path");

const AppErrors = require('./utils/appErrors');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const cookieParser = require("cookie-parser");
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const cors = require("cors");
const compression = require("compression");

const helmet = require("helmet");
const mongoSanitise = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();

app.enable("trust proxy");

app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.options('*', cors());

app.use(helmet());
app.set("views", path.join(__dirname, "views"));

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!' 
});
app.use('/api', limiter);

app.post('/webhook-checkout', 
    express.raw({ type: 'application/json' }),
    bookingController.webhookCheckout
);

app.use(express.json({ limit: "10kb"}));
app.use(express.urlencoded({extended: true, limit: '10Kb'}));
app.use(cookieParser());

app.use(mongoSanitise());

app.use(xss());

app.use(hpp({
    whitelist: [
        "duration"
    ]
}));

app.use(compression());

app.use((req, res, next) => {
    req.requestTime = new Date().toDateString();
    // console.log(req.cookies);
    next();
});



app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/booking', bookingRouter);


app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppErrors(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler); 

module.exports = app; 