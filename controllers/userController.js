const handlerFactory = require("./handlerFactory");
const User = require("../models/userModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
//--------------------------------------------------------

//-------CRUD----------------------------
// GET All USER DETAILS BY ADMIN
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  if (!users) {
    return next(new AppError("Users not Found", 404));
  }

  res
    .status(200)
    .json({ status: "success", results: users.length, data: { users } });
});
//--------------------------------------------------------
// GET SINGLE USER DETAILS BY ADMIN
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(`User does not exist with the id:${req.params.id}`, 404)
    );
  }

  res.status(200).json({ status: "success", data: { user } });
});
//--------------------------------------------------------

// DELETE USER BY ADMIN
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(`User does not exist with the id:${req.params.id}`, 404)
    );
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({ status: "success" }); //204-no data
});
//--------------------------------------------------------

// UPDATE USER PROFILE BY USER
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(`User does not exist with the id:${req.params.id}`, 404)
    );
  }

  //filtering input data
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  //we will add cloudinary later

  const updatedUser = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { updatedUser } });
});
//--------------------------------------------------------

exports.createUser = handlerFactory.createOne(User);
exports.getUser = handlerFactory.getOne(User);
//--------------------------------------------------------

// GET USER DETAILS
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError(`User does not found`, 404));
  }

  res.status(200).json({ status: "success", data: { user } });
});
//--------------------------------------------------------

// UPDATE USER PROFILE BY USER
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  //filtering input data
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    avatar: req.body.avatar,
  };


  const updatedUser = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { user: updatedUser } });
});
