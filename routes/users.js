const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveredirect } = require("../middleware.js");

// ✅ Import Controller
const userController = require("../controllers/user.js");

// ROUTES

// Signup
router.get("/signup", userController.renderSignupForm);
router.post("/signup", wrapAsync(userController.signup));

// Login
router.get("/login", userController.renderLoginForm);
router.post(
  "/login",
  saveredirect,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

// Logout
router.get("/logout", userController.logout);

module.exports = router;
