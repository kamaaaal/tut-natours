class ApiError extends Error{
    // creaating a generalized api to not repeat this code again and again
    constructor(message,statusCode){
        // Error accepts one argument thats the message
        super(message);
        // assigining other values to the error
        this.statusCode = statusCode;
        // using ternary operator to find status (fail or internal Error) 
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // this being a operational error we add isoperational error property to differentiate it from other
        this.isOperational = true;
        
        Error.captureStackTrace(this,this.constructor);
    }
}
module.exports = ApiError;