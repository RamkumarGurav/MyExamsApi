const express = require("express");
const authController = require("../controllers/authController");
const blogController = require("../controllers/blogController");
const router = express.Router();

// GET ALL blogs

router
  .route("/blogs")
  .get(blogController.getAllBlogs)
  .post(authController.isRouteProtected, blogController.createBlog);

// UPDATE AND DELETE Blog
router
  .route("/blogs/:blogId")
  .get(blogController.getBlog)
  .patch(blogController.updateBlog)
  .delete(authController.isRouteProtected, blogController.deleteBlog);

router
  .route("/blogs/mine")
  .get(authController.isRouteProtected, blogController.getMyBlogs);

module.exports = router;
