const express = require("express");
const route = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isowner } = require("../middleware.js");
const { ListingSchema } = require("../schema.js");
const ExpressError = require("../utils/expreserr.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const axios = require("axios");

const listingController = require("../controllers/listing.js");

// ✅ Validation middleware
const validateListing = (req, res, next) => {
  let { error } = ListingSchema.validate(req.body);
  if (error) throw new ExpressError(400, error.details[0].message);
  else next();
};

// ROUTES
route.get("/", wrapAsync(listingController.index));
route.get("/new", isLoggedIn, listingController.renderNewForm);
route.get("/:id", wrapAsync(listingController.showListing));
route.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);
route.get("/:id/edit", isLoggedIn, isowner, wrapAsync(listingController.renderEditForm));
route.put("/:id", isLoggedIn, isowner, upload.single("listing[image]"), wrapAsync(listingController.updateListing));
route.delete("/:id", isLoggedIn, isowner, wrapAsync(listingController.deleteListing));

module.exports = route;
