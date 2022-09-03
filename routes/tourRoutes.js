const express = require('express');
const router = express.Router();

// require controllers
const {
    getAllTours,
    getTourById,
    updateTourById,
    postTour,
    deleteTourByID,
    idChecker,
    bodyChecker,
    topFiveTours,
    tourStats,
    yearlyPlan,
} = require(`${__dirname}/../controllers/tourController`);

//year plan
router.route(`/yearlyPlan`).get(yearlyPlan);
// stats route and this handler is made of aggregation and pipeline
router.route(`/stats`).get(tourStats);
// creating alias route for top5 best tours
router.route('/topFiveTours').get(topFiveTours, getAllTours); // here we pass the middleware first
// so that we don't have to implements the sort and other queries
// param middleware handler
// router.param();
router.param('id', idChecker);

//routing  methods to tourRouter
// chaining methods for a single route
router.route('/').get(getAllTours).post(bodyChecker, postTour);

router
    .route('/:id')
    .get(getTourById)
    .patch(updateTourById)
    .delete(deleteTourByID);

module.exports = router;
