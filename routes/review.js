const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressErrors.js");
const Review = require("../models/review.js");
const listing = require("../models/listing.js");
const reviewController = require("../controllers/review.js");
const {
  isLoggedIn,
  isOwner,
  validateReview,
  isReviewAuthor,
} = require("../middleware.js");

//Review
//Post route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);
//Delete route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);
module.exports = router;
