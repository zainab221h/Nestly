const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");
//const Review = require("../models/review.js");
const flash = require("connect-flash");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

module.exports.index = async (req, res) => {
  const allListings = await listing.find({});
  res.render("listings/index.ejs", { allListings });
};
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};
module.exports.showListing = async (req, res) => {
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
};

module.exports.createListing = async (req, res, next) => {
  let response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      req.body.listing.location
    )}&limit=1`,
    { headers: { "User-Agent": "NestlyApp" } }
  );
  let geoData = await response.json();
  console.log(geoData);

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = {
    type: "Point",
    coordinates: [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)],
  };

  let savedListing = await newListing.save();
  req.flash("success", "NEW LISTING CREATED");
  res.redirect("/listings");
};

module.exports.RenderEditForm = async (req, res) => {
  let { id } = req.params;
  const foundListing = await listing.findById(id);
  if (!foundListing) {
    req.flash("error", "LISTING DOES NOT EXIST");
    return res.redirect("/listings");
  }
  let originalImageUrl = foundListing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { foundListing, originalImageUrl });
};
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let Listing = await listing.findByIdAndUpdate(id, { ...req.body.listing });
  const query = `${req.body.listing.location}, ${req.body.listing.country}`;
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1`,
    { headers: { "User-Agent": "NestlyApp" } }
  );
  const geoData = await response.json();
  if (geoData.length > 0) {
    Listing.geometry = {
      type: "Point",
      coordinates: [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)],
    };
  }
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    Listing.image = { url, filename };
  }
  await Listing.save();
  req.flash("success", "LISTING UPDATED");
  res.redirect(`/listings/${id}`);
};
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", " LISTING DELETED");
  res.redirect("/listings");
};
