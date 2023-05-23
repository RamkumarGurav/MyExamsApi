const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const bookingSchema = new mongoose.Schema(
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
    // role: {
    //   type: String,
    //   enum: ["admin", "user"],
    //   default: "user",
    // },
    // avtar: {
    //   public_id: {
    //     type: String,
    //     required: true,
    //   },
    //   url: {
    //     type: String,
    //     required: true,
    //   },
    // },
    // avatar: {
    //   type: String,
    //   default: "/Profile6.jpg",
    // },
  stayingDays:{
    type:Number,
    required:[true,"Please Enter number of Staying days"]
  },
    checkInDate:{
      type:Date,
      required:[true,"Please Enter Arrival Time"]
    },
    checkOutDate:{
      type:Date,
      required:[true,"Please Enter Arrival Time"]
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


const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
