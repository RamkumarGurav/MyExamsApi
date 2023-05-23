const express = require("express");
const postController = require("../controllers/postController");
const blogController = require("../controllers/blogController");
const authController = require("../controllers/authController");
const router = express.Router();

// Login and Registation and LogoutRoutes
router.get("/posts", blogController.getAllMyBlogs);
router.post("/posts", postController.createPost);

module.exports = router;
