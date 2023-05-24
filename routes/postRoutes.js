const express = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const router = express.Router();

// GET ALL blogs

router
  .route("/posts")
  .get(postController.getAllPosts)
  .post(authController.isRouteProtected, postController.createPost);

router
  .route("/posts/mine")
  .get(authController.isRouteProtected, postController.getAllMyPosts);

// UPDATE AND DELETE post
router
  .route("/posts/:id")
  .get(postController.getPost)
  .patch(authController.isRouteProtected, postController.updatePost)
  .delete(authController.isRouteProtected, postController.deletePost);

module.exports = router;
