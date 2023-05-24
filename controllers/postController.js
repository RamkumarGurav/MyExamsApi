const handlerFactory = require("./handlerFactory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const Post = require("../models/postModel");
//--------------------------------------------------------

//-------------Get All Procuts--------------------------------
exports.getAllPosts = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = req.query.limit; //for pagination
  const postsCount = await Post.countDocuments(); //total no. of posts without any queries

  let features = new APIFeatures(Post.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields();

  // const doc = await features.query.explain();//used for creating indexes
  let posts = await features.query;
  let filteredPostsCount = posts.length; //total no. of posts after queries before pagination because we need to know how many total posts are found before dividing them into pages
  features = new APIFeatures(Post.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(resultsPerPage);

  posts = await features.query;
  const results = posts.length;

  //SENDING RESPONSE
  res.status(200).json({
    status: "success",
    results,
    data: {
      posts,
      postsCount,
      filteredPostsCount,
      currentPage: Number(req.query.page),
      resultsPerPage: resultsPerPage,
      numberOfPages: Math.ceil(postsCount / Number(resultsPerPage)), //calculateing total no. of pages
      numberOfPagesQuery: Math.ceil(
        filteredPostsCount / Number(resultsPerPage)
      ), //calculateing total no. of pages for query results
    },
  });
});
//--------------------------------------------------------
//--------------------------------------------------------
//-------------Get All Procuts--------------------------------
exports.getAllMyPosts = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = req.query.limit; //for pagination
  const postsCount = await Post.countDocuments(); //total no. of posts without any queries

  let features = new APIFeatures(Post.find({ user: req.user._id }), req.query)
    .filter()
    .search()
    .sort()
    .limitFields();

  // const doc = await features.query.explain();//used for creating indexes
  let posts = await features.query;
  let filteredPostsCount = posts.length; //total no. of posts after queries before pagination because we need to know how many total posts are found before dividing them into pages
  features = new APIFeatures(Post.find({ user: req.user._id }), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(resultsPerPage);

  posts = await features.query;
  const results = posts.length;

  //SENDING RESPONSE
  res.status(200).json({
    status: "success",
    results,
    data: {
      posts,
      postsCount,
      filteredPostsCount,
      currentPage: Number(req.query.page),
      resultsPerPage: resultsPerPage,
      numberOfPages: Math.ceil(postsCount / Number(resultsPerPage)), //calculateing total no. of pages
      numberOfPagesQuery: Math.ceil(
        filteredPostsCount / Number(resultsPerPage)
      ), //calculateing total no. of pages for query results
    },
  });
});
//--------------------------------------------------------
//------------Get a Post---------------------------------
exports.getPost = catchAsyncErrors(async (req, res, next) => {
  console.log(req.params.id);
  const post = await Post.findById(req.params.id);

  if (!post) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No post found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: post.length,
    data: {
      post,
    },
  });
});
//--------------------------------------------------------

//------------ADMINS ONLY---------------------------------
//------------Create a Post-------------------------------
exports.createPost = catchAsyncErrors(async (req, res, next) => {
  // req.body.user = req.user._id; //id of user/admin who will create this post
  req.body = {
    ...req.body,
    user: req.user._id,
    authorName: req.user.name,
    authorAvatar:
      "https://res.cloudinary.com/devxhziev/image/upload/v1679750336/samples/people/kitchen-bar.jpg",
  };

  const post = await Post.create(req.body);

  res.status(201).json({
    //201-created
    status: "success",
    results: post.length,
    data: {
      post,
    },
  });
});

//--------------------------------------------------------

//------------Update a Post--------------------------------------
exports.updatePost = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //it returns modified document rather than original
    runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
  });

  if (!post) {
    //throwing error if similar wrong id is search in url
    return next(new AppError("No post found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: post.length,
    data: {
      post,
    },
  });
});
//--------------------------------------------------------

//-------------Delete a Post----------------------------
exports.deletePost = catchAsyncErrors(async (req, res, next) => {
  let post = await Post.findById(req.params.id);
  if (!post) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No post found with that ID ", 404));
  }
  post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No post found with that ID ", 404));
  }

  res.status(204).json({
    //204-no Data
    status: "success",
    data: null,
  });
});
//--------------------------------------------------------

// CREATE Post REVIEW BY USER
exports.createPostReview = catchAsyncErrors(async (req, res, next) => {
  //review object
  const { rating, comment, postId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating,
    comment,
  };

  //since we made validationBeforeSave false we make validtion here only
  if (rating > 5 || rating < 0) {
    return next(new AppError("Rating must be between 0 and 5", 400));
  }

  //finding current post
  const post = await Post.findById(postId);

  //checking whether current user reviewed current post
  //IMP always convert to string when compararing 2 mongodb IDs
  const isReviewed = post.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    //if current user reviewed this post then update his review
    post.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = Number(rating);
        rev.comment = comment;
      }
    });
    // post.numOfReviews = post.reviews.length;
  } else {
    //if current user making his first review on this post then push this review to reviews array
    post.reviews.push(review);
    // post.numOfReviews = post.reviews.length;
  }

  post.numOfReviews = post.reviews.length;

  let sumOfRating = 0; //avgRating=sumOfRating/total no of rating
  post.reviews.forEach((rev) => (sumOfRating += rev.rating));
  post.ratings = sumOfRating / post.reviews.length; //average of ratings

  //since we made validationBeforeSave false we make validtion here only
  if (post.ratings > 5 || post.ratings < 0) {
    return next(new AppError("Rating must be between 0 and 5", 400));
  }

  await post.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
  });
});
//--------------------------------------------------------

// GET ALL REVIEWS OF SINGLE Post
exports.getAllReviews = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.query.id); //here id is post id

  if (!post) {
    return next(new AppError("post not Found", 404));
  }

  res.status(200).json({
    status: "success",
    results: post.reviews.length,
    data: {
      reviews: post.reviews,
    },
  });
});
//--------------------------------------------------------

// DELETE REVIEW
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.query.postId);

  if (!post) {
    return next(new AppError("post not Found", 404));
  }

  //reviews after deleting single review
  const reviews = post.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString() //here req.query.id is id of single review
  );

  const numOfReviews = reviews.length;

  let sumOfRating = 0; //avgRating=sumOfRating/total no of rating
  reviews.forEach((rev) => (sumOfRating += rev.rating));
  const ratings = sumOfRating / reviews.length; //average of ratings

  await Post.findByIdAndUpdate(
    req.query.postId,
    { ratings, reviews, numOfReviews },
    { new: true, runValidators: true }
  );

  res.status(204).json({
    status: "success",
  });
});
