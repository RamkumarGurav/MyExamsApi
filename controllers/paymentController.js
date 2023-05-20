const handlerFactory = require("./handlerFactory");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
    success_url: `${process.env.FRONTEND_URL}/order/payment-success/pi_BkSw7WFuxtjr1RaUmjFUDtj`, //when payment is successfull browsesr goes to this url //
    //--------------------------------------------------------
    //----------------after deployment---------------------------------
    // success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    //--------------------------------------------------------
    cancel_url: `${process.env.FRONTEND_URL}/order/payment-cancelled`, //when payment is cancelled browsesr goes to this url
    customer_email: req.user.email, //need customer email in the reciept
    customer: req.user._id,
    client_reference_id: req.user._id, //tourId is requiered to create booking in the data base

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
            name: `${item.name}`,
            images: [`${item.image}`],
          },
        },
      };
    }),
  });

  // const order = await Order.create({
  //   shippingInfo,
  //   orderedItems,

  //   paymentInfo,

  //   // itemsPrice,
  //   // taxPrice,
  //   // shippingPrice,
  //   totalPrice,
  //   paidAt: Date.now(),
  //   user: req.user._id,
  // });

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
