const express = require("express");
const blogController = require("../controllers/blogController");
const router = express.Router();


// GET ALL USERS
router.route("/blogs").get(blogController.getAllBlogs);
router.route("/blogs").post(blogController.createBlog);

// UPDATE AND DELETE Blog
router
  .route("/blogs/:blogId")
  .get(blogController.getBlog)
  .patch(blogController.updateBlog)
  .delete(blogController.deleteBlog);

module.exports = router;