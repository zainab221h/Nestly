const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveredirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");
const { route } = require("./listing.js");

//signups
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signupUser));

//login
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveredirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(userController.loginUser)
  );

//logout
router.get("/logout", userController.logoutUser);

module.exports = router;
