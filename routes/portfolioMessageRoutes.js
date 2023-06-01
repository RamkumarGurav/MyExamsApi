const express = require("express");

const portfolioMessageController = require("../controllers/portfolioMessageController");

const router = express.Router();

router
  .route("/portfolio-messages")
  .get(portfolioMessageController.getAllPortfolioMessages)
  .post(portfolioMessageController.createPortfolioMessage);
router
  .route("/portfolio-messages/:id")
  .get(portfolioMessageController.getPortfolioMessage)
  .patch(portfolioMessageController.updatePortfolioMessage)
  .delete(portfolioMessageController.deletePortfolioMessage);

  module.exports=router
