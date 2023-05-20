const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please enter blogpost title"],
    },
    subtitle: {
      type: String,
      trim: true,
      required: [true, "Please enter blogpost subtitle"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Please enter blogpost description"],
    },
    author: {
      type: Object,
      default: {
        name: "Ramkumar Gurav",
        img: "/images/author/author1.jpg",
        designation: "CEO and Founder",
      },
    },
    img: {
      type: String,
      default: "/images/img1.jpg",
    },
    publishedAt: {
      type: Date,
      default: Date.now(),
    },
    type: {
      type: String,
      trim: true,
      default: "latest",
    },
    category: {
      type: String,
      trim: true,
      required: [true, "Please enter blogpost category"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
