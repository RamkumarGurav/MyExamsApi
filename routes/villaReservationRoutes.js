const express = require("express");
const villaReservationController = require("../controllers/villaReservationController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/villa-reservations")
  .get(villaReservationController.getAllVillaReservations)
  .post(villaReservationController.createVillaReservation);

router
  .route("/villa-reservations/:id")
  .get(villaReservationController.getVillaReservation)
  .patch(villaReservationController.updateVillaReservation)
  .delete(villaReservationController.deleteVillaReservation);
