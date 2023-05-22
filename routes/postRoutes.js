const express = require("express");
const blogController = require("../controllers/blogController");
const authController = require("../controllers/authController");
const router = express.Router();

// Login and Registation and LogoutRoutes
router.get("/posts", blogController.createBlog);
router.post("/posts", blogController.createBlog);
module.exports = router;
