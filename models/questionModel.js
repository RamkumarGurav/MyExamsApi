const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
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
    question: {
      type: String,
    },
    questionK: {
      type: String,
    },
    qImages: [String],
    answers: {
      type: [String],
      validate: [limitArray(4), "Cannot have more than 4 answers"],
    },
    answersK: {
      type: [String],
      validate: [limitArray(4), "Cannot have more than 4 answers"],
    },
    answerIndex: Number,
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    ansInfo: String,
    ansInfoK: String,
    appearedIn: String,
    info:String,
    tags: [String],
    qSetId:String,
    qSetIdNum:Number,
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

function limitArray(limit) {
  return function (value) {
    return value.length <= limit;
  };
}

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;


