const express = require("express");
const villaPackageBookingController = require("../controllers/villaPackageBookingController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/villa-package-bookings")
  .get(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    villaPackageBookingController.getAllVillaPackageBookings
  );

router
  .route("/villa-package-bookings/create-checkout-session")
  .post(villaPackageBookingController.getCheckoutSession);

router
  .route("/villa-package-bookings/:id")
  .get(villaPackageBookingController.getVillaPackageBooking)
  .patch(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    villaPackageBookingController.updateVillaPackageBooking
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    villaPackageBookingController.deleteVillaPackageBooking
  );

module.exports = router;
