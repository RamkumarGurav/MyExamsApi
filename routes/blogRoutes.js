const express = require("express");

const authController = require("../controllers/authController");
const blogController = require("../controllers/blogController");
const router = express.Router();

// GET ALL blogs

router
  .route("/blogs")
  .get(blogController.getAllBlogs)
  .post(authController.isRouteProtected, blogController.createBlog);

router
  .route("/blogs/mine")
  .get(authController.isRouteProtected, blogController.getAllMyBlogs);

// UPDATE AND DELETE Blog
router
  .route("/blogs/:blogId")
  .get(blogController.getBlog)
  .patch(authController.isRouteProtected, blogController.updateBlog)
  .delete(authController.isRouteProtected, blogController.deleteBlog);

module.exports = router;
