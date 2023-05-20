const handlerFactory = require("./handlerFactory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const Blog = require("../models/blogModel");
//--------------------------------------------------------

//-------------Get All Procuts--------------------------------
exports.getAllBlogs = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = 10; //for pagination
  const blogsCount = await Blog.countDocuments(); //total no. of products without any queries

  let features = new APIFeatures(Blog.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields();

  // const doc = await features.query.explain();//used for creating indexes
  let blogs = await features.query;
  let filteredBlogsCount = blogs.length; //total no. of products after queries before pagination because we need to know how many total products are found before dividing them into pages
  features = new APIFeatures(Blog.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(resultsPerPage);

  blogs = await features.query;

  //SENDING RESPONSE
  res.status(200).json({
    status: "success",
    results: blogs.length,
    data: {
      blogs,
      blogsCount,
      filteredBlogsCount,
      currentPage: Number(req.query.page),
      resultsPerPage: resultsPerPage,
      numberOfPages: Math.ceil(blogsCount / Number(resultsPerPage)), //calculateing total no. of pages
    },
  });
});
//--------------------------------------------------------

//------------Get a Product---------------------------------
exports.getBlog = catchAsyncErrors(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No blog found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: blog.length,
    data: {
      blog,
    },
  });
});
//--------------------------------------------------------

//------------ADMINS ONLY---------------------------------
//------------Create a Product-------------------------------
exports.createBlog = catchAsyncErrors(async (req, res, next) => {
  // req.body.user = req.user._id; //id of user/admin who will create this product
const formData=req.body
  const blog = await Blog.create(formData);

  res.status(201).json({
    //201-created
    status: "success",
    results: blog.length,
    data: {
      blog,
    },
  });
});

//--------------------------------------------------------

//------------Update a Product--------------------------------------
exports.updateBlog = catchAsyncErrors(async (req, res, next) => {
  const blog = await Blog.findByIdAndUpdate(req.params.blogId, req.body, {
    new: true, //it returns modified document rather than original
    runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
  });

  if (!blog) {
    //throwing error if similar wrong id is search in url
    return next(new AppError("No blog found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: blog.length,
    data: {
      blog,
    },
  });
});
//--------------------------------------------------------

//-------------Delete a Product----------------------------
exports.deleteBlog= catchAsyncErrors(async (req, res, next) => {
  let blog = await Blog.findById(req.params.blogId);
  if (!blog) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No blog found with that ID ", 404));
  }
  blog = await Blog.findByIdAndDelete(req.params.blogId);

  if (!blog) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No blog found with that ID ", 404));
  }

  res.status(204).json({
    //204-no Data
    status: "success",
    data: null,
  });
});
//--------------------------------------------------------
