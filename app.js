const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const port = 8080;

const MONGO_URL = "mongodb://127.0.0.1:27017/nestly";
main()
  .then(() => {
    console.log("Connected To Databasw");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);
app.get("/", (req, res) => {
  res.send("root");
});
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new listing({
//     title: "Villa",
//     description: "near swizzalps",
//     //image: "",
//     price: 38000,
//     location: "",
//     country: "Switzerland",
//   });
//   await sampleListing.save();
//   console.log("listing saved");
//   res.send("sucessfull listing");
// });

//index route
app.get("/listings", async (req, res) => {
  const allListings = await listing.find({});
  res.render("listings/index.ejs", { allListings });
});
//new route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
//create route
app.post("/listings", async (req, res) => {
  const newListing = new listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});
//show route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const foundListing = await listing.findById(id);
  res.render("listings/show.ejs", { foundListing });
});
//edit route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const foundListing = await listing.findById(id);
  res.render("listings/edit.ejs", { foundListing });
});
//update route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});
//delete route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

app.listen(port, () => {
  console.log("listening on port 8080");
});
