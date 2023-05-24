const express = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const router = express.Router();

// GET ALL blogs
router.get("/posts", postController.getAlPposts);

router
  .route("/posts")
  .post(authController.isRouteProtected, postController.createPost);

router
  .route("/posts/mine")
  .get(authController.isRouteProtected, postController.getAllMyPosts);

// UPDATE AND DELETE post
router
  .route("/posts/:postId")
  .get(postController.getPost)
  .patch(authController.isRouteProtected, postController.updatePost)
  .delete(authController.isRouteProtected, postController.deletePost);

module.exports = router;
