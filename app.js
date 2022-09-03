const express = require('express');
const fs =  require ('fs');
const morgan = require('morgan');
const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require('./routes/userRoutes');
const {globalErrorHandler} = require(`${__dirname}/controllers/errorContoller`);
const ApiError = require('./utils/apiError');

// importing cors for other for frontend apps
const cors = require('cors');

const app = express();
// middlewares
app.use(express.json());
// alllow cross origin
app.use(cors());

if (process.env.NODE_ENV !== 'production')
    app.use(morgan('dev'));

// static files server
app.use(express.static(`${__dirname}/public`));



// using tour Router in app 
//defining a parent path for all routes in tourRouter
app.use('/api/v1/tours',tourRouter);;
// here we have simply created a subapp for tours resource
// we can also create a another sub app for user rsource simply by
    /* app.use(`api/v1/user`,userRouter); */


/// mounting a auth route
app.use(`/auth`,userRouter);



// handling unhandled routes

app.all('*',(req,res,next) => {
    // res.status(404).json({
    //     message : `can't find ${req.originalUrl} ` 
    // })

    // rewriting the above code to call next(err) method so that we use grobalError
    // const err = new Error(`can't find ${req.originalUrl}`); instead of this Error we can generalize our code with our own Error
    // err.statusCode = 404;
    
    // calling a next function with argument automaticaly invokes the global middleware leving behind other middlewares
    // next(err);
    /////////calling the next function with our ApiError class 
    next(new ApiError(`can't find ${req.originalUrl}`,404))
})

// when passing a callback function with 4 params express assumes it as globalError handler 
// this is a error handelr function triggered when a middleware meets an operational err
app.use(globalErrorHandler); // its handler is imported from errorcontroller.js 

module.exports = app;
