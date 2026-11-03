const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    image: {
      url: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      },
      filename: {
        type: String,
        default: "listingimage",
      },
    },
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    price: Number,
    location: String,
    country: String,
    category: {
      type: String,
      enum: [
        "Trending",
        "Rooms",
        "Iconic cities",
        "Mountains",
        "Castles",
        "Amazing Pools",
        "Camping",
        "Farms",
        "Arctic",
        "Beachfront",
        "Luxury",
      ],
      default: "Trending",
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [77.209, 28.6139], // [longitude, latitude]
      },
    },
    amenities: {
      type: [String],
      default: [
        "Fast Wifi",
        "Free parking on premises",
        "Air conditioning",
        "Dedicated workspace",
        "Kitchen",
      ],
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
