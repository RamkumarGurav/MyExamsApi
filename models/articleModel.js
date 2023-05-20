const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      default: "Gk",
    },
    subjectK: {
      type: String,
      default: "Gk",
    },
    topics: [String],
    topicsK: [String],
    chapter:String,
    chapterK:String,
    images:String,
    heading:String,
    headingK:String,
    subHeading:String,
    subHeadingK:String,
    points:[String],
    pointsK:[String],
    subPoints:[String],
    subPointsK:[String],
    description:[String],
    descriptionK:[String],
    articleNum:Number,
    aritcleSetId:String,
author:{
  type:String,
  default:'admin'
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


const Article = mongoose.model("Article", articleSchema);
module.exports = Article;