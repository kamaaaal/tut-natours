/* 
    catch async function 
    *  its just a wrapper function which calls an async function (argument of type function passed to it)
    *  the callback function passed to this function will be provided with res,req,next 
    *  and the callBack function (handler function) will be chanined(called) with .catch()
    *  .catch() 's callback function will call next functtion with error argument which will be given to global ere handler function
    *  these all we wrapped in a function which accepts req,res,next and this function will be returned 
    *   so the actual handler function will be within the function returned and the actual handler function will be chained with catch()
    * 
*/

exports.catchAsync = (fn) => {
    return (res, req, next) => {
        fn(res, req, next).catch((err) => next(err));
    };
};
