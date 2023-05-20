const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const router = express.Router();

//getting all products
router.route("/products/").get(productController.getAllProducts);

//getting speicific product details
router.route("/products/:id").get(productController.getProduct);

// Create Review by user
router
  .route("/review")
  .patch(
    authController.isRouteProtected,
    productController.createProductReview
  );

//Get all reviews and delete review by user
router
  .route("/reviews")
  .get(productController.getAllReviews)
  .patch(authController.isRouteProtected, productController.deleteReview);

//-------ONLY FOR ADMINS------------------------

//Creating new Product
router.post(
  "/products/new",
  authController.isRouteProtected,
  authController.restrictTo("admin"),
  productController.createProduct
);

//upadte and delete product
router
  .route("products/:id")
  .patch(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    productController.updateProduct
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    productController.deleteProduct
  );

module.exports = router;
