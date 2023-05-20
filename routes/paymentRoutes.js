const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");
const paymentController = require("../controllers/paymentController");
const router = express.Router();

// CREATE A ORDER
router
  .route("/orders/create-checkout-session")
  .post(authController.isRouteProtected, paymentController.getCheckoutSession);

module.exports = router;
