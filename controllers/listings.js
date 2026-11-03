const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const { q, category, minPrice, maxPrice, amenities } = req.query;
  let filter = {};

  if (category && category !== "All") {
    filter.category = category;
  }

  if (q && q.trim() !== "") {
    const searchRegex = new RegExp(q.trim(), "i");
    filter.$or = [
      { title: searchRegex },
      { location: searchRegex },
      { country: searchRegex },
      { description: searchRegex },
    ];
  }

  // Price range filtering
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice && !isNaN(minPrice)) {
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice && !isNaN(maxPrice)) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  // Amenities filtering
  if (amenities) {
    const amenList = Array.isArray(amenities) ? amenities : [amenities];
    filter.amenities = { $all: amenList };
  }

  const allListings = await Listing.find(filter).sort({ createdAt: -1 });

  res.render("index.ejs", {
    allListings,
    currentCategory: category || "All",
    searchQuery: q || "",
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
    selectedAmenities: amenities
      ? Array.isArray(amenities)
        ? amenities
        : [amenities]
      : [],
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "The listing you requested does not exist!");
    return res.redirect("/listings");
  }

  // Ensure images array has at least 5 photos for the mosaic grid
  let images = listing.images && listing.images.length > 0 ? [...listing.images] : [];
  if (listing.image && listing.image.url && !images.some((img) => img.url === listing.image.url)) {
    images.unshift(listing.image);
  }

  if (images.length === 0) {
    images.push({
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
      filename: "default_listing_image",
    });
  }

  // Gracefully pad with existing images if user created a listing with fewer than 5 photos
  const originalLength = images.length;
  while (images.length < 5) {
    images.push({ ...images[(images.length - originalLength) % originalLength] });
  }

  res.render("show.ejs", { listing, showcaseImages: images });
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  let uploadedImages = [];
  if (req.files) {
    if (req.files["listing[images]"]) {
      uploadedImages.push(
        ...req.files["listing[images]"].map((f) => ({ url: f.path, filename: f.filename }))
      );
    }
    if (req.files["listing[image]"]) {
      uploadedImages.push(
        ...req.files["listing[image]"].map((f) => ({ url: f.path, filename: f.filename }))
      );
    }
  }

  if (uploadedImages.length > 0) {
    newListing.images = uploadedImages;
    newListing.image = uploadedImages[0];
  } else {
    const defaultImg = {
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
      filename: "default_listing",
    };
    newListing.image = defaultImg;
    newListing.images = [defaultImg];
  }

  await newListing.save();
  req.flash("success", "New Luxury Listing Created!");
  res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "The listing you requested does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl =
    listing.image && listing.image.url
      ? listing.image.url.replace("/upload", "/upload/w_300")
      : "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60";

  res.render("edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  let uploadedImages = [];
  if (req.files) {
    if (req.files["listing[images]"]) {
      uploadedImages.push(
        ...req.files["listing[images]"].map((f) => ({ url: f.path, filename: f.filename }))
      );
    }
    if (req.files["listing[image]"]) {
      uploadedImages.push(
        ...req.files["listing[image]"].map((f) => ({ url: f.path, filename: f.filename }))
      );
    }
  }

  if (uploadedImages.length > 0) {
    listing.images.push(...uploadedImages);
    listing.image = uploadedImages[0];
    await listing.save();
  }

  req.flash("success", "Listing Updated Successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
};
