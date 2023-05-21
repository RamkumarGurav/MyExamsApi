const handlerFactory = require("./handlerFactory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const Blog = require("../models/blogModel");
//--------------------------------------------------------

//-------------Get All Procuts--------------------------------
exports.getAllBlogs = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = req.query.limit; //for pagination
  const blogsCount = await Blog.countDocuments(); //total no. of Blogs without any queries

  let features = new APIFeatures(Blog.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields();

  // const doc = await features.query.explain();//used for creating indexes
  let blogs = await features.query;
  let filteredBlogsCount = blogs.length; //total no. of blogs after queries before pagination because we need to know how many total blogs are found before dividing them into pages
  features = new APIFeatures(Blog.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(resultsPerPage);

  blogs = await features.query;
  const results = blogs.length;

  //SENDING RESPONSE
  res.status(200).json({
    status: "success",
    results,
    data: {
      blogs,
      blogsCount,
      filteredBlogsCount,
      currentPage: Number(req.query.page),
      resultsPerPage: resultsPerPage,
      numberOfPages: Math.ceil(blogsCount / Number(resultsPerPage)), //calculateing total no. of pages
      numberOfPagesQuery: Math.ceil(
        filteredBlogsCount / Number(resultsPerPage)
      ), //calculateing total no. of pages for query results
    },
  });
});
//--------------------------------------------------------

//------------Get a blog---------------------------------
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
//------------Create a blog-------------------------------
exports.createBlog = catchAsyncErrors(async (req, res, next) => {
  // req.body.user = req.user._id; //id of user/admin who will create this blog
  let formData = req.body;
  formData.user = req.user._id;
  formData.authorName = req.user.name;
  formData.author = req.user.avatar;
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

//------------Update a blog--------------------------------------
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

//-------------Delete a blog----------------------------
exports.deleteBlog = catchAsyncErrors(async (req, res, next) => {
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
