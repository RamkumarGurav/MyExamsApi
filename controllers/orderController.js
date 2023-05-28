const handlerFactory = require("./handlerFactory");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const Email = require("../utils/Email");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//--------------------------------------------------------
//--------------------------------------------------------

//------------Creating and sending Checkout Session---------------------------------------
exports.getCheckoutSession = catchAsyncErrors(async (req, res, next) => {
  //step1)Get the currently booked tour
  const {
    shippingInfo,
    orderedItemsDetails,
    // paymentInfo,
    address,
    totalPrice,
  } = req.body;

  let ids = orderedItemsDetails.map((item, i) => {
    // const product = await Product.findById(item.productId);
    return item.productId;
  });
  const idsString = ids.join("--");
  const records = await Product.find().where("_id").in(ids).exec();
  // console.log(records);
  // console.log(orderedItems);
  const orderedItems = records.map((rec, i) => {
    return {
      name: rec._doc.name,
      productId: rec._doc._id,
      image: rec._doc.images[0].url,
      price: rec._doc.price,
      quantity: orderedItemsDetails[i].quantity,
    };
  });

  // console.log(orderedItems);

  //step2)Create the checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment", //mode of session
    payment_method_types: ["card"], //payment methods
    //---------------dev mod-------------------------------
    // success_url: `${process.env.FRONTEND_URL}/order/payment-success/pi_BkSw7WFuxtjr1RaUmjFUDtj`, //when payment is successfull browsesr goes to this url //
    //--------------------------------------------------------
    //----------------after deployment---------------------------------
    success_url: `${process.env.FRONTEND_URL}/order/payment-success`, //when
    //--------------------------------------------------------
    cancel_url: `${process.env.FRONTEND_URL}/order/payment-cancelled`, //when payment is cancelled browsesr goes to this url
    customer_email: req.user.email, //need customer email in the reciept
    customer: req.user._id,
    client_reference_id: idsString, //productID or Customer Email Id is requiered to create booking in the data base
    // shipping_address_collection: {
    //   allowed_countries: ["IN"], // Specify the allowed countries for shipping
    // },
    metadata: {
      ...shippingInfo,
      totalPrice: totalPrice,
    },

    // shipping_options: [
    //   {
    //     shipping_rate_data: {
    //       type: "fixed_amount",
    //       fixed_amount: {
    //         amount: 100,
    //         currency: "inr",
    //       },
    //       display_name: "BlipKart shiipping",
    //       delivery_estimate: {
    //         minimum: {
    //           unit: "business_day",
    //           value: 1,
    //         },
    //         maximum: {
    //           unit: "business_day",
    //           value: 1,
    //         },
    //       },
    //     },
    //   },
    // ],
    line_items: orderedItems.map((item) => {
      return {
        quantity: item.quantity,
        price_data: {
          currency: "inr",
          unit_amount: item.price * 100, //converting in rupee//1 rupee is 100paisa
          product_data: {
            name: `${item.name}--${item.productId}`,
            images: [`${item.image}`],
          },
        },
      };
    }),
  });

  //step3)send the checkout session in response
  res.status(200).json({
    status: "success",
    session,
    paymentInfo: { sessionId: session.id, status: "completed" },
    orderedItems,
    shippingInfo,
    totalPrice,
    // paidAt: Date.now(),
    user: req.user._id,
  });
});

const createOrderCheckout = async (sessionX) => {
  const message = `Hi ${
    shippingInfo.name
  }\n\nCongradulations! Your Order is being Placed,\n \n Thank you for shopping at MyExams.com\n\n ${JSON.stringify(
    sessionX
  )}\n\nIf you have not requested this email then Please ignore it`;

  const userX = { email: sessionX.customer_email, name: shippingInfo.name };
  await new Email(userX, message).sendOrderPlacedMsg();

  const session = await stripe.checkout.sessions.retrieve(`${sessionX.id}`, {
    expand: ["line_items"],
  });
  // let items;
  // stripe.checkout.sessions.listLineItems(
  //   session.id,
  //   { limit: 20 },
  //   function (err, lineItems) {
  //     items = lineItems;
  //   }
  // );

  // console.log(session);
  const shippingInfo = {
    name: session.metadata.name,
    address: session.metadata.address,
    city: session.metadata.city,
    state: session.metadata.state,
    country: session.metadata.country,
    phoneNo: session.metadata.phoneNo,
    pinCode: session.metadata.pinCode,
  };

  const paymentInfo = { sessionId: sessionX.id, status: "completed" };
  const totalPrice = session.metadata.totalPrice;
  const user = session.customer;
  const orderedItems = session.line_items.map((item) => {
    return {
      name: item.price_data.product_data.name.split("--")[0],
      product: item.price_data.product_data.name.split("--")[1],

      image: item.price_data.product_data.images[0],
      price: item.price_data.unit_amount / 100,
      quantity: item.quantity,
    };
  });

  const order = await Order.create({
    shippingInfo,
    orderedItems,
    paymentInfo,
    totalPrice,
    paidAt: Date.now(),
    user: user,
  });

  if (order) {
    const message = `Hi ${shippingInfo.name}\n\nCongradulations! Your Order is successfully Placed,\n \n Thank you for shopping at MyExams.com\n\nIf you have not requested this email then Please ignore it`;

    const user = { email: session.customer_email, name: shippingInfo.name };
    await new Email(user, message).sendOrderPlacedMsg();
  }
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    createOrderCheckout(event.data.object);
  }

  res.status(200).json({ received: true, session: event.data.object });
};

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
