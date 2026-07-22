const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");
//const Review = require("../models/review.js");
const flash = require("connect-flash");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

//index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);
//new route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});
//create route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "NEW LISTING CREATED");
    res.redirect("/listings");
  })
);
//show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const foundListing = await listing
      .findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    if (!foundListing) {
      req.flash("error", "LISTING DOES NOT EXIST");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { foundListing });
  })
);
//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const foundListing = await listing.findById(id);
    if (!foundListing) {
      req.flash("error", "LISTING DOES NOT EXIST");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { foundListing });
  })
);
//update route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    await listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "LISTING UPDATED");
    res.redirect(`/listings/${id}`);
  })
);
//delete route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", " LISTING DELETED");
    res.redirect("/listings");
  })
);
module.exports = router;
