const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');

/// generalized sign token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        /// options object to set expiry token
        expiresIn: '3h',
    });
};

// creating an signup contorller  // wrapping it up in a catch async function
exports.signup = catchAsync(async (req, res, next) => {
    const user = req.body;

    const createdUser = await UserModel.create(user);

    /// singing a token
    const secret = signToken(createdUser._id);

    // sending resonse with a user
    return res.status(201).json({
        status: 'success',
        token: secret,
        // data: createdUser,
    });
});

exports.login = catchAsync(async (req, res) => {
    // extracting mail and password
    const { email, password } = req.body;
    // thorowing error if doesn't exists
    if (!email || !password) {
        throw new ApiError('please provide email and password');
    }

    /// cgetting the use from data base
    /// we have also set password : {select : false }
    /// so now we have to pull the passowrd manually from the mongoose
    const user = await UserModel.findOne({ email }).select('+password');

    /// if the user exists then we have to compare their password
    /// tp compare we use bcrypt.verify but the verify function can be
    /// instannce method which will live on every user objects
    /// queried by mongoose

    /// if the user exists we will check the password
    /// we write both the condition in the same because
    /// if any condtion fails both it will thorugh the same message
    if (!user || !(await user.verifyPassword(password, user.password))) {
        console.log(user);
        throw new ApiError(`email or password does not mach `);
    }

    /// if the code flows till here
    /// we can then send the user  a token

    /// we are creating a token always with id
    /// so we can write a seperate function
    /// for that alone
    const token = signToken(user._id);

    res.status(201).json({
        status: 'success',
        token,
    });
});
