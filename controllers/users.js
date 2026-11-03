const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Review = require("../models/review");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", `Welcome to WanderLust, ${username}!`);
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", `Welcome back, ${req.user.username}!`);
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out successfully.");
    res.redirect("/listings");
  });
};

// 1. User Profile
module.exports.renderProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  const myListingCount = await Listing.countDocuments({ owner: req.user._id });
  const myReviewCount = await Review.countDocuments({ author: req.user._id });
  const myTripsCount = await Booking.countDocuments({ guest: req.user._id });

  res.render("users/profile.ejs", {
    user,
    myListingCount,
    myReviewCount,
    myTripsCount,
  });
};

module.exports.updateProfile = async (req, res) => {
  const { email, bio, phone } = req.body;
  await User.findByIdAndUpdate(req.user._id, { email, bio, phone });
  req.flash("success", "Your profile details have been updated!");
  res.redirect("/profile");
};

// 2. Host & Guest Dashboard
module.exports.renderDashboard = async (req, res) => {
  const hostListings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
  const hostBookings = await Booking.find({ host: req.user._id })
    .populate("listing")
    .populate("guest")
    .sort({ createdAt: -1 });

  const guestTrips = await Booking.find({ guest: req.user._id })
    .populate("listing")
    .populate("host")
    .sort({ createdAt: -1 });

  // Compute Revenue
  const totalRevenue = hostBookings.reduce((sum, b) => {
    return b.status === "Confirmed" ? sum + (b.totalPrice || 0) : sum;
  }, 0);

  res.render("users/dashboard.ejs", {
    hostListings,
    hostBookings,
    guestTrips,
    totalRevenue,
  });
};

// 3. Create Booking
module.exports.createBooking = async (req, res) => {
  const { listingId, checkIn, checkOut, nights, guestsCount, totalPrice } = req.body.booking;
  const listing = await Listing.findById(listingId);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const booking = new Booking({
    listing: listing._id,
    guest: req.user._id,
    host: listing.owner || req.user._id,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    nights: Number(nights) || 1,
    guestsCount: Number(guestsCount) || 2,
    totalPrice: Number(totalPrice) || Number(listing.price),
    status: "Confirmed",
  });

  await booking.save();
  req.flash("success", `🎉 Reservation confirmed for ${listing.title}! View it below.`);
  res.redirect("/dashboard");
};

// 4. Update Booking Status (Accept / Cancel)
module.exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await Booking.findByIdAndUpdate(id, { status });
  req.flash("success", `Booking status updated to ${status}!`);
  res.redirect("/dashboard");
};
