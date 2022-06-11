const express = require('express');
const authController = require("./../controllers/authController");
const {getAllTours, aliasTopTours, getTourStats,
     createTour, getTour, getMonthlyPlan,
     updateTour, deletTour, getToursWithin, getDistances, resizeTourImages, uploadTourImages} = require('./../controllers/tourController');
const reviewRouter = require("./../routes/reviewRoutes");


const router = express.Router();

// router.param('id', checkID);
router.use("/:tourId/reviews", reviewRouter);

router.route('/top-5-cheapest')
    .get(aliasTopTours, getAllTours);

router.route('/monthly-plan/:year')
    .get(authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        getMonthlyPlan);

router.route('/tour-stats')
    .get(getTourStats);

router
    .route("/tours-within/:distance/center/:latlng/unit/:unit")
    .get(getToursWithin);

router
    .route("/distances/:latlng/unit/:unit")
    .get(getDistances);


router.route('/')
    .get(getAllTours)
    .post(authController.protect,
          authController.restrictTo('admin', 'lead-guide'),
          createTour);

router.route('/:id')
    .get(getTour)
    .patch(
            authController.protect,
            authController.restrictTo('admin', 'lead-guide'),
            uploadTourImages,
            resizeTourImages,
            updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        deletTour);



module.exports = router;