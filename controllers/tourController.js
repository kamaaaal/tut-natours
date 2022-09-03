const toursPath = `${__dirname}/../dev-data/data/tours-simple.json`;
// import apiFeatures
const apiFeatures = require(`${__dirname}/../utils/reqQueryHandler`);
const ApiError = require('../utils/apiError');
// import models
const tourModel = require(`${__dirname}/../models/tourModel`);
const { catchAsync } = require(`../utils/catchAsync`);
// importing simple tours json
const tours = require(toursPath);

// creating routes for tour resource
// handler function

/// alias for top best cheap tours
// this will be a middleare which modifies the query string,to get desired output from getAllTours
exports.topFiveTours = function (req, res, next) {
    // this will be miidleware so we set next parameter too
    req.query.sort = '-ratingsAverage,price'; // here we use minus sign to sort in descending order
    req.query.limit = 5; // only five will be projected
    req.query.page = 1;
    // call next
    next();
};

// stats function which creaates a stats for all document
exports.tourStats = catchAsync(async function (req, res) {
    try {
        // agrregate function has multiple states where all data's are passed and proccessed in the pipeline
        const stats = await tourModel.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } },
            },
            {
                $group: {
                    _id: `$ratingsAverage`,
                    totalToursOfId: { $sum: 1 },
                    numRatings: { $sum: `$ratingsQuantity` },
                    ratAvg: { $avg: `$ratingsAverage` }, // average mathematical operator used for calc. avg
                    // we mention documents fields within quotes prefixed by $ sign
                    avgPrice: { $avg: `$price` },
                    minPrice: { $min: `$price` },
                    maxPrice: { $max: `$price` },
                },
            },
            {
                $sort: { id: 1 },
            },
            {
                $match: { _id: { $ne: 4.9 } },
            },
        ]);
        res.status(200).json({
            status: 'sucess',
            results: stats.length,
            data: stats,
        });
    } catch (err) {
        console.log(err);
    }
});
// handler for get requests
// trying out async functions
exports.yearlyPlan = catchAsync(async (req, res) => {
    const year = 21; //req.params.year;

    const pipeline = [
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gt: new Date('2021-01-01'),
                    $lt: new Date('2022-01-01'),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                startDates: '$startDates',
                numOfTours: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $sort: {
                _id: 1,
            },
        },
    ];

    const result = await tourModel.aggregate(pipeline);

    res.status(200).json({
        status: 'sucess',
        results: result.length,
        data: result,
    });
});
exports.getAllTours = catchAsync(async (req, res) => {
    // we use api features class for interpreting all fields of queryString
    const apiProcess = new apiFeatures(tourModel.find(), req.query); // passing find query and request queryString
    apiProcess.find().fields().sort().paginate(); // by this way we process queryString by apiFeatures class
    const tourList = await apiProcess.query;
    res.status(200).json({
        status: 'sucess',
        results: tourList.length,
        data: tourList,
    });
});
//handler for get requests with param id
exports.getTourById = catchAsync(async (req, res, next) => {
    const tour = await tourModel.findById(req.params.id);

    /// when no tours found we call next function with err
    if (!tour) {
        throw new ApiError(`no tours found with id ${req.params.id}`, 404);
    }

    // we can also trow an error which will be caught by catchAsync and it will call the next(Err) function
    // if (!tour)  throw (new ApiError(`no tours found with id ${req.params.id}`,404))

    res.status(200).json({
        status: 'sucess',
        data: tour,
    });
});

const showMsg = (req, res) => {
    res.status(404).send("please mention the api and api's version");
};

// handler for post methods
exports.postTour = (req, res, next) => {
    const tour = new tourModel(req.body);
    // console.log(tour);
    tour.save(tour)
        .then((doc) => {
            console.log(doc);
            res.status(201).json({
                status: 'sucess',
                data: doc,
            });
        })
        .catch((err) => {
            console.log(err);
            // console.log(err);
            // res.status(403).json({
            //     status: 'failed',
            //     data: err.message,
            // });
            next(err);
        });
};

// body checker for post requests
exports.bodyChecker = (req, res, next) => {
    const body = req.body;

    if (!body.name || body.name === '') {
        return res.status(400).json({
            status: 'failed',
            message: 'name cannot be empty string',
        });
    }

    next();
};

// id checker for all parameter requests
exports.idChecker = (req, res, next, val) => {
    if (val <= 0 || val >= tours.length)
        return res.status(404).send('unknwon id paramter');

    next();
};

// handler for patch requests
exports.updateTourById = async (req, res) => {
    try {
        const result = await tourModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidator: true,
            }
        );
        res.status(200).send(result);
    } catch (err) {
        res.status(404).send();
    }
};

// handler for delete requests
exports.deleteTourByID = catchAsync(async (req, res, next) => {
    const deleted = await tourModel.findByIdAndDelete(req.params.id);

    /// thorwong error when there is no tour with that id
    if (!deleted) {
        throw new ApiError(`no tours found with id ${req.params.id}`, 404);
    }

    // when deleteing we don't have to send any data
    res.status(204).send();
});
