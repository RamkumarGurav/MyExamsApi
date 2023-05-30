const express = require("express");
const villaReservationController = require("../controllers/villaReservationController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/villa-reservations")
  .get(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    villaReservationController.getAllVillaReservations
  )
  .post(villaReservationController.createVillaReservation);

router
  .route("/villa-reservations/:id")
  .get(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    villaReservationController.getVillaReservation
  )
  .patch(villaReservationController.updateVillaReservation)
  .delete(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    villaReservationController.deleteVillaReservation
  );

module.exports = router;
