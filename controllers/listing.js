const Listing = require("../models/listings.js");
const ExpressError = require("../utils/expreserr.js");
const { ListingSchema } = require("../schema.js");
const axios = require("axios");

// ✅ Index - show all listings
module.exports.index = async (req, res) => {
  const query = req.query.q || ""; // get search term from URL
  let alllistings;

  if (query) {
    // do a simple case-insensitive search in title or location
    alllistings = await Listing.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } }
      ]
    });
  } else {
    // if no search, show all listings
    alllistings = await Listing.find({});
  }

  res.render("index.ejs", { alllistings });
};

// ✅ Render new form
module.exports.renderNewForm = (req, res) => {
  res.render("newlisting");
};

// ✅ Show specific listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listingbyid = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listingbyid) {
    req.flash("error", "The listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("show", { listingbyid });
};

// ✅ Create new listing with geocoding
module.exports.createListing = async (req, res) => {
  try {
    const { listing } = req.body;
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;

    // 🌍 Geocode location
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      listing.location
    )}`;
    const response = await axios.get(geoUrl, {
      headers: { "User-Agent": "YourAppName/1.0" }, // Required by Nominatim
    });

    if (response.data && response.data.length > 0) {
      const lat = parseFloat(response.data[0].lat);
      const lon = parseFloat(response.data[0].lon);
      newListing.geometry = {
        type: "Point",
        coordinates: [lon, lat],
      };
    } else {
      newListing.geometry = {
        type: "Point",
        coordinates: [78.9629, 20.5937],
      };
    }

    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error("❌ Geocoding error:", err.message);
    req.flash("error", "Failed to create listing. Try again!");
    res.redirect("/listings/new");
  }
};

// ✅ Render edit form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listingbyid = await Listing.findById(id);
  if (!listingbyid) {
    req.flash("error", "Cannot find that listing!");
    return res.redirect("/listings");
  }
  res.render("edit", { listingbyid });
};

// ✅ Update listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listings = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listings.image = { url, filename };
    await listings.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// ✅ Delete listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
