const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");
//const Review = require("../models/review.js");
const flash = require("connect-flash");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingController.index)) //index route
  .post(
    //create route
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,

    wrapAsync(listingController.createListing)
  );

router.get("/search", wrapAsync(listingController.searchListings));
//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id") //show route
  .get(wrapAsync(listingController.showListing))
  .put(
    //update route
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,

    wrapAsync(listingController.updateListing)
  )
  .delete(
    //delete route
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.RenderEditForm)
);
module.exports = router;
