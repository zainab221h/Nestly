const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressErrors.js");
const Review = require("../models/review.js");
const listing = require("../models/listing.js");
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
  wrapAsync(async (req, res) => {
    let Listing = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    Listing.reviews.push(newReview);
    await newReview.save();
    await Listing.save();
    req.flash("success", "NEW REVIEW CREATED");

    console.log("new response saved");
    //res.send("new review saved");
    res.redirect(`/listings/${Listing._id}`);
  })
);
//Delete route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", " REVIEW DELETED");
    res.redirect(`/listings/${id}`);
  })
);
module.exports = router;
