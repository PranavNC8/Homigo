const express = require("express");
const route = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isreviewAuthor } = require("../middleware.js");

// ✅ Import controller
const reviewController = require("../controllers/review.js");

// ROUTES

// Create Review
route.post(
  "/",
  isLoggedIn,
  reviewController.validateReview,
  wrapAsync(reviewController.createReview)
);

// Delete Review
route.delete(
  "/:reviewId",
  isLoggedIn,
  isreviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = route;
