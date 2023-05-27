const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");
const router = express.Router();

// // CREATE A ORDER
router
  .route("/orders/create-checkout-session")
  .post(authController.isRouteProtected, orderController.getCheckoutSession);

// GET MY ALL ORDERS DETAILS
router
  .route("/orders/me")
  .get(authController.isRouteProtected, orderController.getMyOrders);

// GET SINGLE ORDER DETAILS
router
  .route("/orders/:id")
  .get(authController.isRouteProtected, orderController.getSingleOrder);

//cancel my order
router
  .route("/orders/cancel-my-order/:id")
  .patch(authController.isRouteProtected, orderController.cancelMyOrder);

// GET ALL ORDERs DETAILS BY ADMIN
router
  .route("/orders")
  .get(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    orderController.getAllOrders
  );

// UPDATE ORDER STATUS & DELETE ORDER BY ADMIN
router
  .route("/orders/:id")
  .patch(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    orderController.updateOrder
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    orderController.deleteOrder
  );

module.exports = router;
