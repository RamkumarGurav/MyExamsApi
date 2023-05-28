const express = require("express");
const questionController = require("../controllers/questionController");
const authController = require("../controllers/authController");
const router = express.Router();

// GET ALL USERS
router.route("/questions").get(questionController.getAllQuestions);
router
  .route("/questions")
  .post(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    questionController.createQuestion
  );

// UPDATE AND DELETE question
router
  .route("/questions/:questionId")
  .get(questionController.getQuestion)
  .patch(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    questionController.updateQuestion
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    questionController.deleteQuestion
  );

module.exports = router;
