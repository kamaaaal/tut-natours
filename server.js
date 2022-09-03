// requireinf dotenv
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// passing config object's path as path property to dotenv.config
dotenv.config({ path: `${__dirname}/config.env` });

/// handling uncaughtException at the top level 
/// so that it listen to the all errors  
process.on('uncaughtException', (err) => {
    console.log("UNCAUGHT EXCEPTION");
    console.log(err);
    /// stoing the app 
    process.exit(1);
})


// require app after configuring environment varaibles, so that app can also use the environment variables
const app = require(`${__dirname}/app.js`);

const DBURL = process.env.DBURL;
const port = process.env.PORT;

// connecting to the db
//     usual way of conecting to a db
mongoose
    .connect(DBURL, { useNewUrlParser: true, dbName: 'natours' })
    .then((con) => console.log('connected to dbServer'))
    .catch((err) => console.log(err));

// // trying async await iife function to connect to db
// (async () => {
//     try{
//         const connection = await mongoose.connect(DBURL);
//         connection && console.log('connected to dbServer');
//     }
//     catch(err){
//         console.log(err);
//     }
// })();

// lsiten to a port
// using environemnt variable PORT for port

// storing the server to close it whenever a unhandled rejection happens
const server = app.listen(port, () => {
    console.log('listening to the port', port);
});

///listening to all unhandledRejection
process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection');
    console.log(err);
    /// exiting the app after closing the server
    /// so that we handle all processing request
    server.close(() => {
        /// stoping the app after closing the server
        console.log('exiting the app');
        process.exit(1);
    })
})
