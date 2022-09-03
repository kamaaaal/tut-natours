const mongoose = require('mongoose');
const fs = require('fs');
// tour model
const TourModel = require('./models/tourModel');
const { argv } = require('process');
require('dotenv').config({ path: './config.env' });

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const DBURL = process.env.DBURL;
const DBNAME = process.env.DBNAME;

console.log('dburl', DBNAME);
// connecting to mongo's server
mongoose
    .connect(`${DBURL}`, { dbName: DBNAME })
    .then((con) => {
        console.log('connected');
    })
    .catch((err) => {
        console.log(`not connected`);
    });

const feedData = () => {
    TourModel.create(tours)
        .then(() => {
            console.log(`created succesfully`);
        })
        .catch((err) => console.log(err))
        .finally(() => process.exit());
};

const deleteDbData = () => {
    setTimeout(() => {
        console.log('connecting');
    }, 0);
    TourModel.deleteMany()
        .then(() => console.log('deleted'))
        .catch((err) => console.log(err))
        .finally(() => process.exit());
};

if (argv[2] === `--import`) {
    feedData();
} else if (argv[2] === `--delete`) {
    deleteDbData();
} else {
    console.log(`${argv[2]} unkonwn command`);
}
