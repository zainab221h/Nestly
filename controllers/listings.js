const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
  const query = `${req.body.listing.location}, ${req.body.listing.country}`;
  let response = await fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      query
    )}&key=${process.env.OPENCAGE_API_KEY}&limit=1`
  );

  if (!response.ok) {
    req.flash(
      "error",
      "Location service temporarily unavailable, please try again"
    );
    return res.redirect("/listings/new");
  }

  let geoData = await response.json();

  if (!geoData.results || geoData.results.length === 0) {
    req.flash("error", "Location not found, please enter a valid location");
    return res.redirect("/listings/new");
  }

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = {
    type: "Point",
    coordinates: [
      geoData.results[0].geometry.lng,
      geoData.results[0].geometry.lat,
    ],
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
    `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      query
    )}&key=${process.env.OPENCAGE_API_KEY}&limit=1`
  );

  if (response.ok) {
    const geoData = await response.json();
    if (geoData.results && geoData.results.length > 0) {
      Listing.geometry = {
        type: "Point",
        coordinates: [
          geoData.results[0].geometry.lng,
          geoData.results[0].geometry.lat,
        ],
      };
    }
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
module.exports.searchListings = async (req, res) => {
  const { destination } = req.query;

  if (!destination || destination.trim() === "") {
    const allListings = await listing.find({});
    return res.render("listings/index.ejs", { allListings });
  }

  const allListings = await listing.find({
    location: { $regex: destination, $options: "i" },
  });
  res.render("listings/index.ejs", { allListings });
};
module.exports.generateDescription = async (req, res) => {
  const { title, location, country } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Write a warm, appealing Airbnb-style property description (2-3 sentences, max 60 words) for a listing titled "${title}" located in ${location}, ${country}. Only return the description text, no preamble.`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();

    res.json({ description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate description" });
  }
};
