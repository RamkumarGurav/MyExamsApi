const handlerFactory = require("./handlerFactory");
const User = require("../models/userModel");
const VillaPackageBooking = require("../models/VillaPackageBookingModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const Email = require("../utils/Email");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    email,
    phoneNo,
    price,
    checkInDate,
    rooms,
    days,
    checkOutDate,
  } = req.body;

  //step2)Create the checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment", //mode of session
    payment_method_types: ["card"], //payment methods
    //---------------dev mod-------------------------------
    // success_url: `${process.env.FRONTEND_URL}/order/payment-success/pi_BkSw7WFuxtjr1RaUmjFUDtj`, //when payment is successfull browsesr goes to this url //
    //--------------------------------------------------------
    //----------------after deployment---------------------------------
    success_url: `${process.env.FRONTEND_URL_RV}/buy-packages/payment-success`, //when
    //--------------------------------------------------------
    cancel_url: `${process.env.FRONTEND_URL_RV}/buy-packages/payment-cancelled`, //when payment is cancelled browsesr goes to this url
    customer_email: email, //need customer email in the reciept
    customer: name, //sending req.user._id doesnt work u will get null value so send email and then find user
    client_reference_id:"royalVillas", //productID or Customer  Id is requiered to create booking in the data base
    // shipping_address_collection: {
    //   allowed_countries: ["IN"], // Specify the allowed countries for shipping
    // },
    metadata: {
      ...req.body,
    },

    line_items: [
      {
        quantity: 1,

        price_data: {
          currency: "inr",
          unit_amount: price * 100, //converting in rupee//1 rupee is 100paisa
          product_data: {
            name: `${packageName}`,
            // images: [`${item.image}`],
          },
        },
      },
    ],
  });

  //step3)send the checkout session in response
  res.status(200).json({
    status: "success",
    session,
    paymentInfo: { sessionId: session.id, status: "completed" },
  });
});

//-------------Get All Procuts--------------------------------
exports.getAllVillaPackageBookings = catchAsyncErrors(
  async (req, res, next) => {
    const resultsPerPage = req.query.limit; //for pagination
    const villaPackageBookingsCount =
      await VillaPackageBooking.countDocuments(); //total no. of products without any queries

    let features = new APIFeaturesMCQS(VillaPackageBooking.find(), req.query)
      .filter()
      .search()
      .sort()
      .limitFields();

    // const doc = await features.query.explain();//used for creating indexes
    let villaPackageBookings = await features.query;
    let filteredVillaPackageBookingsCount = villaPackageBookings.length; //total no. of products after queries before pagination because we need to know how many total products are found before dividing them into pages
    features = new APIFeaturesMCQS(VillaPackageBooking.find(), req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate(resultsPerPage);

    villaPackageBookings = await features.query;
    const results = villaPackageBookings.length;

    //SENDING RESPONSE
    res.status(200).json({
      status: "success",
      results,
      data: {
        villaPackageBookings,
        villaPackageBookingsCount,
        filteredVillaPackageBookingsCount,
        currentPage: Number(req.query.page),
        resultsPerPage: resultsPerPage,
        numberOfPages: Math.ceil(
          villaPackageBookingsCount / Number(resultsPerPage)
        ), //calculateing total no. of pages
        numberOfPagesQuery: Math.ceil(
          filteredVillaPackageBookingsCount / Number(resultsPerPage)
        ), //calculateing total no. of pages for query results
      },
    });
  }
);

//------------Get a villaPackageBooking---------------------------------
exports.getVillaPackageBooking = catchAsyncErrors(async (req, res, next) => {
  const villaPackageBooking = await VillaPackageBooking.findById(req.params.id);

  if (!villaPackageBooking) {
    //throwing error if similar wrong id is searched in url
    return next(
      new AppError("No VillaPackageBooking found with that ID ", 404)
    );
  }

  res.status(200).json({
    status: "success",
    results: villaPackageBooking.length,
    data: {
      villaPackageBooking,
    },
  });
});
//-------------------------------------------------------

//------------Update a villaPackageBooking--------------------------------------
exports.updateVillaPackageBooking = catchAsyncErrors(async (req, res, next) => {
  const villaPackageBooking = await VillaPackageBooking.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true, //it returns modified document rather than original
      runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
    }
  );

  if (!villaPackageBooking) {
    //throwing error if similar wrong id is search in url
    return next(
      new AppError("No VillaPackageBooking found with that ID ", 404)
    );
  }

  res.status(200).json({
    status: "success",
    results: villaPackageBooking.length,
    data: {
      villaPackageBooking,
    },
  });
});
//--------------------------------------------------------

//-------------Delete a villaPackageBooking----------------------------
exports.deleteVillaPackageBooking = catchAsyncErrors(async (req, res, next) => {
  let villaPackageBooking = await VillaPackageBooking.findById(req.params.id);
  if (!villaPackageBooking) {
    //throwing error if similar wrong id is searched in url
    return next(
      new AppError("No villaPackageBooking found with that ID ", 404)
    );
  }
  villaPackageBooking = await VillaPackageBooking.findByIdAndDelete(
    req.params.id
  );

  if (!villaPackageBooking) {
    //throwing error if similar wrong id is searched in url
    return next(
      new AppError("No VillaPackageBooking found with that ID ", 404)
    );
  }

  res.status(204).json({
    //204-no Data
    status: "success",
    data: null,
  });
});
//--------------------------------------------------------
