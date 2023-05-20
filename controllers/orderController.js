const handlerFactory = require("./handlerFactory");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
//--------------------------------------------------------

// CREATE ORDER
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { shippingInfo, orderedItems, paymentInfo, totalPrice, user } =
    req.body;
  // console.log(shippingInfo, orderedItems, paymentInfo, totalPrice,user);

  const order = await Order.create({
    shippingInfo,
    orderedItems,
    paymentInfo,
    totalPrice,
    paidAt: Date.now(),
    userId: user,
  });

  res.status(201).json({
    status: "success",
    data: {
      order,
      orderId: order._id,
    },
  });
});
//--------------------------------------------------------

//  GET MY ORDERs DETAILS
exports.getMyOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ userId: req.user._id });

  res
    .status(200)
    .json({ status: "success", results: orders.length, data: { orders } });
});

//--------------------------------------------------------

//  GET SINGLE ORDER DETAILS BY ADMIN
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  ); //also displaying user's name and email using populate

  if (!order) {
    return next(new AppError("Order not Found with this ID", 404));
  }

  res.status(200).json({ status: "success", data: { order } });
});
//--------------------------------------------------------

//  GET ALL ORDERs DETAILS BY ADMIN
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name email"); //also displaying user's name and email using populate

  let totalAmount = 0;

  orders.forEach((order) => (totalAmount += order.totalPrice));

  res.status(200).json({
    status: "success",
    results: orders.length,
    totalAmount,
    data: { orders },
  });
});
//--------------------------------------------------------

//  UPDATE ORDER STATUS BY ADMIN
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  //step1: finding order
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not Found with this ID", 404));
  }

  //step2:checking whether order is delivered or not
  if (order.orderStatus === "delivered") {
    return next(new AppError("You have already delivered this order", 400));
  }

  //step3:updating stock of the products which are ordered and to be deliverd
  order.orderedItems.forEach(async (item) => {
    await updateStock(item.productId, item.quantity);
  });

  //step4:updating orderStatus and setting deliveredAt field if order is delivered
  order.orderStatus = req.body.status;
  if (req.body.status === "delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

//  UPDATE ORDER STATUS BY User
exports.cancelMyOrder = catchAsyncErrors(async (req, res, next) => {
  //step1: finding order
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not Found with this ID", 404));
  }

  //step2:checking whether order is cancelled or not
  if (order.orderStatus === "requested for cancelation") {
    return next(
      new AppError(
        "You have already requested for Cancelation for this order",
        400
      )
    );
  }

  // //step3:updating stock of the products which are ordered and to be deliverd
  // order.orderedItems.forEach(async (item) => {
  //   await updateStock(item.productId, item.quantity);
  // });

  //step4:updating orderStatus and setting cancelledAt field if order is cancelled
  order.orderStatus = "requested for cancelation";
  if (req.body.status === "requested for cancelation") {
    order.cancelledAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: { order },
  });
});
//--------------------------------------------------------

const updateStock = async (id, quantity) => {
  //updating stock of ordered products
  const product = await Product.findById(id);
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
};
//--------------------------------------------------------

//  DELETING ORDER BY ADMIN
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not Found with this ID", 404));
  }

  await Order.findOneAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
  });
});
