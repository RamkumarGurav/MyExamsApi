const handlerFactory = require("./handlerFactory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const VillaReservation = require("../models/villaReservationModel");
//--------------------------------------------------------

//-------------Get All Procuts--------------------------------
exports.getAllVillaReservations = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = req.query.limit; //for pagination
  const villaReservationsCount = await VillaReservation.countDocuments(); //total no. of villareservations without any queries

  let features = new APIFeatures(VillaReservation.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields();

  // const doc = await features.query.explain();//used for creating indexes
  let villaReservations = await features.query;
  let filteredVillaReservationsCount = villaReservations.length; //total no. of villareservations after queries before pagination because we need to know how many total villareservations are found before dividing them into pages
  features = new APIFeatures(VillaReservation.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(resultsPerPage);

  villaReservations = await features.query;
  const results = villaReservations.length;

  //SENDING RESPONSE
  res.status(200).json({
    status: "success",
    results,
    data: {
      villaReservations,
      villaReservationsCount,
      filteredVillaReservationsCount,
      currentPage: Number(req.query.page),
      resultsPerPage: resultsPerPage,
      numberOfPages: Math.ceil(villaReservationsCount / Number(resultsPerPage)), //calculateing total no. of pages
      numberOfPagesQuery: Math.ceil(
        filteredVillaReservationsCount / Number(resultsPerPage)
      ), //calculateing total no. of pages for query results
    },
  });
});
//--------------------------------------------------------

//------------Get a VillaReservation---------------------------------
exports.getVillaReservation = catchAsyncErrors(async (req, res, next) => {
  const villaReservation = await VillaReservation.findById(req.params.id);

  if (!villaReservation) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No villareservation found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: villaReservation.length,
    data: {
      villaReservation,
    },
  });
});
//--------------------------------------------------------

//------------ADMINS ONLY---------------------------------
//------------Create a VillaReservation-------------------------------
exports.createVillaReservation = catchAsyncErrors(async (req, res, next) => {
  const villaReservation = await VillaReservation.create(req.body);

  res.status(201).json({
    //201-created
    status: "success",
    results: villaReservation.length,
    data: {
      villaReservation,
    },
  });
});

//--------------------------------------------------------

//------------Update a VillaReservation--------------------------------------
exports.updateVillaReservation = catchAsyncErrors(async (req, res, next) => {
  const villaReservation = await VillaReservation.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true, //it returns modified document rather than original
      runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
    }
  );

  if (!villaReservation) {
    //throwing error if similar wrong id is search in url
    return next(new AppError("No villaReservation found with that ID ", 404));
  }

  res.status(200).json({
    status: "success",
    results: villaReservation.length,
    data: {
      villaReservation,
    },
  });
});
//--------------------------------------------------------

//-------------Delete a VillaReservation----------------------------
exports.deleteVillaReservation = catchAsyncErrors(async (req, res, next) => {
  let villaReservation = await VillaReservation.findById(req.params.id);
  if (!villaReservation) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No villaReservation found with that ID ", 404));
  }
  villaReservation = await VillaReservation.findByIdAndDelete(req.params.id);

  if (!villaReservation) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No villareservation found with that ID ", 404));
  }

  res.status(204).json({
    //204-no Data
    status: "success",
    data: null,
  });
});
//--------------------------------------------------------
