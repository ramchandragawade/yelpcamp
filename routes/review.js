const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviewController = require('../controllers/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Add campground review form route(POST)
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview));
// delete review route
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));

module.exports = router;