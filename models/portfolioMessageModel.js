const mongoose = require("mongoose");
const validator = require("validator");

const portfolioMessagesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter Your Name"],
      maxlength: [50, "name must contain less than 50 characters"],
      minlength: [2, "name must contain more than 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter Your email"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter valid email"],
    },
    message: {
      type: String,
      required: [true, "Please Enter Your Message"],
      maxlength: [1000, "message must contain less than 1000 characters"],
      minlength: [2, "message must contain more than 2 characters"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const PortfolioMessage = mongoose.model(
  "PortfolioMessage",
  portfolioMessagesSchema
);

module.exports = PortfolioMessage;
