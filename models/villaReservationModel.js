const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const villaReservationSchema = new mongoose.Schema(
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
      minlength: 10,
    },
    rooms: {
      type: Number,
      min: [1, "number of rooms must be above 1"],
      max: [20, "number of rooms must be below 20"],
      required: [true, "Please enter number of rooms you want to book"],
    },
    checkInDate: {
      type: Date,
      required: [true, "Please Enter Check-in Date"],
    },
    checkOutDate: {
      type: Date,
      required: [true, "Please Enter Check-Out Date"],

      validate: {
        validator: function (checkOutDate) {
          // this only points to current doc on NEW document creation
          return checkOutDate >= this.checkInDate;
        },
        message: "check-out should be greater than check-in date",
      },
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

const VillaReservation = mongoose.model(
  "VillaReservation",
  villaReservationSchema
);

module.exports = VillaReservation;
