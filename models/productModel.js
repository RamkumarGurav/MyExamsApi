const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter product Name"],
    },
    productType:{
      type:String,
      default:'book',
    },
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
      required: [true, "Please enter Product Price"],
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

    // images: [
    //   {
    //     url: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    // ],
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
    author: {
      type: String,
      required: [true, "Please enter Author name"],
    },
    publication: {
      type: String,
      required: [true, "Please enter Publication name"],
    },

    stock: {
      type: Number,
      default: 1,
      maxLength: [4, "Stock can not exceed 4 characters"],
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
      //id of user/admin who creataed this product
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

productSchema.virtual("orgPrice").get(function () {
  let dPrice = this.price * ((100 + this.discount) / 100);
  return parseInt(dPrice);
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
