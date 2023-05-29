const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const villaPackageBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter user name"],
      trim: true,
      maxlength: [50, "name must contain less than 50 characters"],
      minlength: [2, "name must contain more than 2 characters"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Please enter user email"],
      lowercase: true,
      validate: [validator.isEmail, "Enter valid email"],
    },
    phone: {
      type: Number,
      required: [true, "Please enter user phonenumber"],
    },
    packageName: {
      type: String,
      enum: {
        values: [
          "4999-3-standard-villa",
          "6999-5-superior-villa",
          "8999-7-ultra-villa",
          "10999-9-galactic-villa",
          "12999-11-infinity-villa",
          "13999-20-cosmic-villa",
        ],
        message: "please select an appropriate packagename",
      },
    },
    checkInDate: {
      type: Date,
      required: [true, "Please Enter Check-in Date"],
    },
    checkOutDate: {
      type: Date,
      required: [true, "Please Enter Check-in Date"],
    },
    days: {
      type: Number,
      required: [true, "Please Enter Number Staying Days"],
    },
    rooms: {
      type: Number,
      min: [1, "rooms must be above 1"],
      max: [20, "rooms must be below 20"],
      required: [true, "Please Enter Number of  Rooms"],
    },
    price: {
      type: Number,
      min: [4999, "price must be minimum 4999 rupees"],
      required: [true, "Please Enter Packange Price"],
    },


    paymentInfo: {
      sessionId: {
        type: String,
        // required: true,
      },
      status: {
        type: String,
        // required: true,
      },
    },
    paidAt: {
      type: Date,
      // required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const VillaPackageBooking = mongoose.model(
  "VillaPackageBooking",
  villaPackageBookingSchema
);

module.exports = VillaPackageBooking;
