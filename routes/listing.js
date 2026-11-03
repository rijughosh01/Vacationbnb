const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });
const uploadFields = upload.fields([
  { name: "listing[image]", maxCount: 1 },
  { name: "listing[images]", maxCount: 5 },
]);

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, uploadFields, validateListing, wrapAsync(listingController.createListing));

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Wishlist Toggle API (must be placed before /:id routes or as a sub-path)
router.post("/:id/wishlist", wrapAsync(listingController.toggleWishlist));

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner, uploadFields, validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
