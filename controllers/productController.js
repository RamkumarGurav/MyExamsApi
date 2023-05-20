const handlerFactory = require("./handlerFactory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const Product = require("../models/productModel");
//--------------------------------------------------------

//-------------Get All Procuts--------------------------------
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = req.query.limit; //for pagination
  const productsCount = await Product.countDocuments(); //total no. of products without any queries

  let features = new APIFeatures(Product.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields();

  // const doc = await features.query.explain();//used for creating indexes
  let products = await features.query;
  let filteredProductsCount = products.length; //total no. of products after queries before pagination because we need to know how many total products are found before dividing them into pages
  features = new APIFeatures(Product.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(resultsPerPage);

  products = await features.query;
  const results = products.length;

  //SENDING RESPONSE
  res.status(200).json({
    status: "success",
    results,
    data: {
      products,
      productsCount,
      filteredProductsCount,
      currentPage: Number(req.query.page),
      resultsPerPage: resultsPerPage,
      numberOfPages: Math.ceil(productsCount / Number(resultsPerPage)), //calculateing total no. of pages
      numberOfPagesQuery: Math.ceil(
        filteredProductsCount / Number(resultsPerPage)
      ), //calculateing total no. of pages for query results
    },
  });
});
//--------------------------------------------------------

//------------Get a Product---------------------------------
exports.getProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No product found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: product.length,
    data: {
      product,
    },
  });
});
//--------------------------------------------------------

//------------ADMINS ONLY---------------------------------
//------------Create a Product-------------------------------
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user._id; //id of user/admin who will create this product

  const product = await Product.create(req.body);

  res.status(201).json({
    //201-created
    status: "success",
    results: product.length,
    data: {
      product,
    },
  });
});

//--------------------------------------------------------

//------------Update a Product--------------------------------------
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //it returns modified document rather than original
    runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
  });

  if (!product) {
    //throwing error if similar wrong id is search in url
    return next(new AppError("No product found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: product.length,
    data: {
      product,
    },
  });
});
//--------------------------------------------------------

//-------------Delete a Product----------------------------
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No product found with that ID ", 404));
  }
  product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No product found with that ID ", 404));
  }

  res.status(204).json({
    //204-no Data
    status: "success",
    data: null,
  });
});
//--------------------------------------------------------

// CREATE PRODUCT REVIEW BY USER
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  //review object
  const { rating, comment, productId } = req.body;
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

  //finding current product
  const product = await Product.findById(productId);

  //checking whether current user reviewed current product
  //IMP always convert to string when compararing 2 mongodb IDs
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    //if current user reviewed this product then update his review
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = Number(rating);
        rev.comment = comment;
      }
    });
    // product.numOfReviews = product.reviews.length;
  } else {
    //if current user making his first review on this product then push this review to reviews array
    product.reviews.push(review);
    // product.numOfReviews = product.reviews.length;
  }

  product.numOfReviews = product.reviews.length;

  let sumOfRating = 0; //avgRating=sumOfRating/total no of rating
  product.reviews.forEach((rev) => (sumOfRating += rev.rating));
  product.ratings = sumOfRating / product.reviews.length; //average of ratings

  //since we made validationBeforeSave false we make validtion here only
  if (product.ratings > 5 || product.ratings < 0) {
    return next(new AppError("Rating must be between 0 and 5", 400));
  }

  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
  });
});
//--------------------------------------------------------

// GET ALL REVIEWS OF SINGLE PRODUCT
exports.getAllReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id); //here id is product id

  if (!product) {
    return next(new AppError("Product not Found", 404));
  }

  res.status(200).json({
    status: "success",
    results: product.reviews.length,
    data: {
      reviews: product.reviews,
    },
  });
});
//--------------------------------------------------------

// DELETE REVIEW
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new AppError("Product not Found", 404));
  }

  //reviews after deleting single review
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString() //here req.query.id is id of single review
  );

  const numOfReviews = reviews.length;

  let sumOfRating = 0; //avgRating=sumOfRating/total no of rating
  reviews.forEach((rev) => (sumOfRating += rev.rating));
  const ratings = sumOfRating / reviews.length; //average of ratings

  await Product.findByIdAndUpdate(
    req.query.productId,
    { ratings, reviews, numOfReviews },
    { new: true, runValidators: true }
  );

  res.status(204).json({
    status: "success",
  });
});
