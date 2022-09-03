const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

/// user schema for auth controller
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'must enter name to create a user'],
    },
    email: {
        type: String,
        required: [true, 'must provide an email'],
        unique: true, /// email should be unique
        lowercase: true, // email's are lowercase always
        /// need to validate whether its actually an email
        validate: [validator.isEmail, 'email is not valid'],
    },
    photo: String,

    password: {
        type: String,
        required: [true, 'must provide a password'],
        minlength: 8,
        select: false,
    },
    /// will be useful whenever we have to verify
    passwordConfirm: {
        type: String,
        required: [true, 'must enter confirm password'],
        minlength: 8,
        validate: {
            validator: function (passwordConfirm) {
                /// not using arrow function to get the other values through "this" keyword
                return passwordConfirm === this.password;
            },
            message: 'confirm password is not same',
        },
    },
});

/// adding encryption on presave hook
UserSchema.pre('save', async function (next) {
    /// checking whether the password is modified
    // so that we don't have to encrypt the already encrypted password
    if (!this.isModified('password'))
        // this keyword will the doc only if this function is not an arrow function
        next(); // if password is not modified then we go to the next middleware

    this.password = await bcrypt.hash(this.password, 10); // hashing the password if its modified

    /// removing the confrim password from the document
    /// by simply setting it to undefined
    this.passwordConfirm = undefined;
});

/// defining instanc method
UserSchema.methods.verifyPassword = async function (inputPass, existingPass) {
    return await bcrypt.compare(inputPass, existingPass);
};

/// creating a model from schema
const UserModel = mongoose.model('User', UserSchema);



/// exporting the model ;
module.exports = UserModel;
