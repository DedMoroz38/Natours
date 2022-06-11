const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({mergeParams: true});

router
    .route('/')
    .get(reviewController.getAll)
    .post(
        authController.protect,
        authController.restrictTo("user"),
        reviewController.setTourUserIds,
        reviewController.createReview
    );

router
    .route("/:id")
    .get(reviewController.getReview)
    .patch(authController.protect, authController.restrictTo("user", "admin"), reviewController.updateReview)
    .delete(authController.restrictTo("user", "admin"), reviewController.deleteReview);

module.exports = router;