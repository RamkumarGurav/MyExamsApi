const handlerFactory = require("./handlerFactory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeaturesMCQS = require("../utils/APIFeaturesMCQS");
const Question = require("../models/questionModel");
//--------------------------------------------------------

//-------------Get All Procuts--------------------------------
exports.getAllQuestions = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = req.query.limit; //for pagination
  const questionsCount = await Question.countDocuments(); //total no. of products without any queries

  let features = new APIFeaturesMCQS(Question.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields();

  // const doc = await features.query.explain();//used for creating indexes
  let questions = await features.query;
  let filteredQuestionsCount = questions.length; //total no. of products after queries before pagination because we need to know how many total products are found before dividing them into pages
  features = new APIFeaturesMCQS(Question.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(resultsPerPage);

  questions = await features.query;
  const results = questions.length;

  //SENDING RESPONSE
  res.status(200).json({
    status: "success",
    results,
    data: {
      questions,
      questionsCount,
      filteredQuestionsCount,
      currentPage: Number(req.query.page),
      resultsPerPage: resultsPerPage,
      numberOfPages: Math.ceil(questionsCount / Number(resultsPerPage)), //calculateing total no. of pages
      numberOfPagesQuery: Math.ceil(
        filteredQuestionsCount / Number(resultsPerPage)
      ), //calculateing total no. of pages for query results
    },
  });
});
//--------------------------------------------------------

//------------Get a Product---------------------------------
exports.getQuestion = catchAsyncErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.questionId);

  if (!question) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No question found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: question.length,
    data: {
      question,
    },
  });
});
//--------------------------------------------------------

//------------ADMINS ONLY---------------------------------
//------------Create a Product-------------------------------
exports.createQuestion = catchAsyncErrors(async (req, res, next) => {
  // req.body.user = req.user._id; //id of user/admin who will create this product
  const formData = req.body;
  const question = await Question.create(formData);

  res.status(201).json({
    //201-created
    status: "success",
    results: question.length,
    data: {
      question,
    },
  });
});

//--------------------------------------------------------

//------------Update a Product--------------------------------------
exports.updateQuestion = catchAsyncErrors(async (req, res, next) => {
  const question = await Question.findByIdAndUpdate(
    req.params.questionId,
    req.body,
    {
      new: true, //it returns modified document rather than original
      runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
    }
  );

  if (!question) {
    //throwing error if similar wrong id is search in url
    return next(new AppError("No question found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: question.length,
    data: {
      question,
    },
  });
});
//--------------------------------------------------------

//-------------Delete a Product----------------------------
exports.deleteQuestion = catchAsyncErrors(async (req, res, next) => {
  let question = await Question.findById(req.params.questionId);
  if (!question) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No question found with that ID ", 404));
  }
  question = await Question.findByIdAndDelete(req.params.questionId);

  if (!question) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No question found with that ID ", 404));
  }

  res.status(204).json({
    //204-no Data
    status: "success",
    data: null,
  });
});
//--------------------------------------------------------
