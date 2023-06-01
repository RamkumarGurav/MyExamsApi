const handlerFactory = require("./handlerFactory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeaturesMCQS = require("../utils/APIFeaturesMCQS");
const PortfolioMessage = require("../models/portfolioMessageModel");
//--------------------------------------------------------

exports.getAllPortfolioMessages = handlerFactory.getAll(PortfolioMessage);

//--------------------------------------------------------

exports.createPortfolioMessage = catchAsyncErrors(async (req, res, next) => {
  const formData = req.body;
  const portfolioMessage = await PortfolioMessage.create(formData);

  const message = `Hi Ramkumar , ${portfolioMessage.name} sent you a message from portfolio\n name : ${portfolioMessage.name}
  \n email : ${portfolioMessage.email}
  \n message : ${portfolioMessage.message}
`;

  const user = { email: "raamthecoder@gmail.com", name: portfolioMessage.name };
  await new Email(user, message).sendporfolioMessage();

  res.status(201).json({
    status: "success",
    results: portfolioMessage.length,
    data: {
      portfolioMessage,
    },
  });
});

exports.getPortfolioMessage = handlerFactory.getOne(PortfolioMessage);
exports.updatePortfolioMessage = handlerFactory.updateOne(PortfolioMessage);
exports.deletePortfolioMessage = handlerFactory.deleteOne(PortfolioMessage);
