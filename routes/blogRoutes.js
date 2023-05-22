const express = require("express");
const authController = require("../controllers/authController");
const blogController = require("../controllers/blogController");
const router = express.Router();

// GET ALL USERS
router
  .route("/blogs")
  .get(authController.isRouteProtected, blogController.getAllBlogs);

router
  .route("/blogs")
  .post(authController.isRouteProtected, blogController.createBlog);

// UPDATE AND DELETE Blog
router
  .route("/blogs/:blogId")
  .get(blogController.getBlog)
  .patch(blogController.updateBlog)
  .delete(authController.isRouteProtected, blogController.deleteBlog);

module.exports = router;
