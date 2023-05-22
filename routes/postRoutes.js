const express = require("express");
const postController = require("../controllers/postController");
const authController = require("../controllers/authController");
const cors = require("cors");
const router = express.Router();

router.options("/posts", cors());

// Login and Registation and LogoutRoutes
router.get("/posts", postController.getAllPosts);
router.post("/posts", postController.createPost);

module.exports = router;
