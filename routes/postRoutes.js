const express = require("express");
const blogController = require("../controllers/blogController");
const authController = require("../controllers/authController");
const router = express.Router();

// Login and Registation and LogoutRoutes
router.post(
  "/posts",
  authController.isRouteProtected,
  blogController.createBlog
);
module.exports = router;
