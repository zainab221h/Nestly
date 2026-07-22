const listing = require("./models/listing.js");
const review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressErrors.js");
module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.user);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "LOGIN TO CREATE LISTING");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveredirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let Listing = await listing.findById(id);
  if (!Listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "YOU ARE NOT THE OWNER OF THIS LISTING");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  //console.log("BODY RECEIVED:", req.body);
  let { error } = reviewSchema.validate(req.body || {});

  if (error) {
    //console.log("Validation error:", error.details);
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let Review = await review.findById(reviewId);
  if (!Review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "YOU ARE NOT THE AUTHOR OF THIS LISTING");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
