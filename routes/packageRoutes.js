const express = require("express");
const packageController = require("../controllers/packageController");
const authController = require("../controllers/authController");
const router = express.Router();

//getting all packages
router.route("/packages/").get(packageController.getAllPackages);

//getting speicific package details
router
  .route("/package/:id")
  .get(packageController.getPackage);

// Create Review by user
router
  .route("/review")
  .patch(
    authController.isRouteProtected,
    packageController.createPackageReview
  );

//Get all reviews and delete review by user
router
  .route("/reviews")
  .get(packageController.getAllReviews)
  .patch(authController.isRouteProtected, packageController.deleteReview);

//-------ONLY FOR ADMINS------------------------

//Creating new package
router.post(
  "/packages/new",
  authController.isRouteProtected,
  authController.restrictTo("admin"),
  packageController.createPackage
);

//upadte and delete package
router
  .route("packages/:id")
  .patch(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    packageController.updatePackage
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    packageController.deletePackage
  );

module.exports = router;
