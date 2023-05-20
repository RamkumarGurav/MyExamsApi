const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter package Name"],
    },
    titleContent: [String],
    validity: {
      type: String,
      default: "lifetime",
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      maxLength: [8, "Price can not not exceed 8 characters"],
      required: [true, "Please enter package Price"],
    },
    discount: {
      type: Number,
    },

    ratings: {
      type: Number,
      max: [5, "Rating must be below or equal to 5"],
      min: [0, "Rating must be above or equal to 1"],
      default: 0,
    },

    category: {
      type: String,
      default: "all",
    },
    subject: {
      type: String,
    },
    popularityType: {
      type: String,
    },

    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    images: [
      {
        public_id: {
          type: String,
          default: "public_id",
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      //id of user/admin who creataed this package
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
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

packageSchema.virtual("orgPrice").get(function () {
  let dPrice = this.price * ((100 + this.discount) / 100);
  return parseInt(dPrice);
});

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
