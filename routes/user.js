const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/users.js");

// Signup
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

// Login
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

// Logout
router.get("/logout", userController.logout);

// Profile
router
  .route("/profile")
  .get(isLoggedIn, wrapAsync(userController.renderProfile))
  .post(isLoggedIn, wrapAsync(userController.updateProfile));

// Host & Guest Dashboard
router.get("/dashboard", isLoggedIn, wrapAsync(userController.renderDashboard));

// My Wishlists
router.get("/wishlist", isLoggedIn, wrapAsync(userController.renderWishlist));

// Bookings
router.post("/bookings", isLoggedIn, wrapAsync(userController.createBooking));
router.post("/bookings/:id/status", isLoggedIn, wrapAsync(userController.updateBookingStatus));

module.exports = router;
