const express = require("express");
const app = express();
const mongoose = require("mongoose");
//const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressErrors.js");
//const { listingSchema, reviewSchema } = require("./schema.js");
//const Review = require("./models/review.js");
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");

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

app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

app.all("/*all", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

//error
app.use((err, req, res, next) => {
  let { status = 500, message = "something went wrong" } = err;
  res.status(status).render("error.ejs", { message });
  //res.status(status).send(message);
});

app.listen(port, () => {
  console.log("listening on port 8080");
});
