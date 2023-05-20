const handlerFactory = require("./handlerFactory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const Package = require("../models/packageModel");
//--------------------------------------------------------

//-------------Get All Procuts--------------------------------
exports.getAllPackages = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = 9; //for pagination
  const packagesCount = await Package.countDocuments(); //total no. of packages without any queries

  let features = new APIFeatures(Package.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields();

  // const doc = await features.query.explain();//used for creating indexes
  let packages = await features.query;
  let filteredPackagesCount = packages.length; //total no. of packages after queries before pagination because we need to know how many total packages are found before dividing them into pages
  features = new APIFeatures(Package.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(resultsPerPage);

  packages = await features.query;

  //SENDING RESPONSE
  res.status(200).json({
    status: "success",
    results: packages.length,
    data: {
      packages,
      packagesCount,
      filteredPackagesCount,
      currentPage: Number(req.query.page),
      resultsPerPage: resultsPerPage,
      numberOfPages: Math.ceil(packagesCount / Number(resultsPerPage)), //calculateing total no. of pages
    },
  });
});
//--------------------------------------------------------

//------------Get a package---------------------------------
exports.getPackage = catchAsyncErrors(async (req, res, next) => {
  const package = await Package.findById(req.params.id);

  if (!package) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No package found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: package.length,
    data: {
      package,
    },
  });
});
//--------------------------------------------------------

//------------ADMINS ONLY---------------------------------
//------------Create a package-------------------------------
exports.createPackage = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user._id; //id of user/admin who will create this package

  const package = await Package.create(req.body);

  res.status(201).json({
    //201-created
    status: "success",
    results: package.length,
    data: {
      package,
    },
  });
});

//--------------------------------------------------------

//------------Update a package--------------------------------------
exports.updatePackage = catchAsyncErrors(async (req, res, next) => {
  const package = await Package.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //it returns modified document rather than original
    runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
  });

  if (!package) {
    //throwing error if similar wrong id is search in url
    return next(new AppError("No package found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: package.length,
    data: {
      package,
    },
  });
});
//--------------------------------------------------------

//-------------Delete a package----------------------------
exports.deletePackage = catchAsyncErrors(async (req, res, next) => {
  let package = await Package.findById(req.params.id);
  if (!package) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No package found with that ID ", 404));
  }
  package = await Package.findByIdAndDelete(req.params.id);

  if (!package) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No package found with that ID ", 404));
  }

  res.status(204).json({
    //204-no Data
    status: "success",
    data: null,
  });
});
//--------------------------------------------------------

// CREATE package REVIEW BY USER
exports.createPackageReview = catchAsyncErrors(async (req, res, next) => {
  //review object
  const { rating, comment, packageId } = req.body;
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

  //finding current package
  const package = await Package.findById(packageId);

  //checking whether current user reviewed current package
  //IMP always convert to string when compararing 2 mongodb IDs
  const isReviewed = package.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    //if current user reviewed this package then update his review
    package.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = Number(rating);
        rev.comment = comment;
      }
    });
    // package.numOfReviews = package.reviews.length;
  } else {
    //if current user making his first review on this package then push this review to reviews array
    package.reviews.push(review);
    // package.numOfReviews = package.reviews.length;
  }

  package.numOfReviews = package.reviews.length;

  let sumOfRating = 0; //avgRating=sumOfRating/total no of rating
  package.reviews.forEach((rev) => (sumOfRating += rev.rating));
  package.ratings = sumOfRating / package.reviews.length; //average of ratings

  //since we made validationBeforeSave false we make validtion here only
  if (package.ratings > 5 || package.ratings < 0) {
    return next(new AppError("Rating must be between 0 and 5", 400));
  }

  await package.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
  });
});
//--------------------------------------------------------

// GET ALL REVIEWS OF SINGLE package
exports.getAllReviews = catchAsyncErrors(async (req, res, next) => {
  const package = await Package.findById(req.query.id); //here id is package id

  if (!package) {
    return next(new AppError("Package not Found", 404));
  }

  res.status(200).json({
    status: "success",
    results: package.reviews.length,
    data: {
      reviews: package.reviews,
    },
  });
});
//--------------------------------------------------------

// DELETE REVIEW
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const package = await Package.findById(req.query.packageId);

  if (!package) {
    return next(new AppError("Package not Found", 404));
  }

  //reviews after deleting single review
  const reviews = package.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString() //here req.query.id is id of single review
  );

  const numOfReviews = reviews.length;

  let sumOfRating = 0; //avgRating=sumOfRating/total no of rating
  reviews.forEach((rev) => (sumOfRating += rev.rating));
  const ratings = sumOfRating / reviews.length; //average of ratings

  await Package.findByIdAndUpdate(
    req.query.packageId,
    { ratings, reviews, numOfReviews },
    { new: true, runValidators: true }
  );

  res.status(204).json({
    status: "success",
  });
});
