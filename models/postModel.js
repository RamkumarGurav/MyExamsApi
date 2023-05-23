const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
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
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      required: [true, "Please enter blogpost author name"],
    },
    authorAvatar: {
      type: String,
      required: [true, "Please enter blogpost author avatar "],
    },
    image: {
      type: String,
      default: "/defautlPost.jpg",
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
    publishedAt: {
      type: Date,
      default: Date.now(),
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

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
