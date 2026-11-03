if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const user = await User.findOne({});
  const ownerId = user ? user._id : "6ae9b76a92e84fb832adea39";

  const defaultAmenities = [
    "Fast Wifi (150 Mbps)",
    "Free parking on premises",
    "Air conditioning",
    "Dedicated workspace",
    "Kitchen & Refrigerator",
    "HDTV with Netflix",
  ];

  initData.data = initData.data.map((obj) => {
    return {
      ...obj,
      category: obj.category || "Trending",
      geometry: obj.geometry || {
        type: "Point",
        coordinates: [77.209, 28.6139],
      },
      amenities: obj.amenities || defaultAmenities,
      owner: ownerId,
    };
  });

  await Listing.insertMany(initData.data);
  console.log(`Successfully initialized database with ${initData.data.length} luxury categorized listings!`);
  mongoose.connection.close();
};
