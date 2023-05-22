const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const blogController = require("../controllers/blogController");
const router = express.Router();

router.post(
  "/blogposts",
  authController.isRouteProtected,
  blogController.createBlog
);
// Login and Registation and LogoutRoutes
router.post("/users/register", authController.registerUser);
router.post("/users/login", authController.login);
router.get("/users/logout", authController.logout);

router.post(
  "/users/posts",
  authController.isRouteProtected,
  blogController.createBlog
);

// FORGOT AND RESET PASSWORD
router.post("/users/password/forgot", authController.forgotPassword);
router.patch("/users/password/reset/:token", authController.resetPassword);

// UPDATE MY PASSWORD
router.patch(
  "/users/password/update",
  authController.isRouteProtected,
  authController.updatePassword
);

//GET USER DETAILS
router.get(
  "/users/me",
  authController.isRouteProtected,
  userController.getUserDetails
);

// UPDATE USER PROFILE
router.patch(
  "/users/me/update",
  authController.isRouteProtected,
  userController.updateUserProfile
);

//------------ROUTES FOR ADMINS ONLY-----------------------------

// GET ALL USERS
router
  .route("/users/")
  .get(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );

// UPDATE AND DELETE USER
router
  .route("/users/:id")
  .get(
    // authController.isRouteProtected,
    // authController.restrictTo("admin"),
    userController.getSingleUser
  )
  .patch(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    userController.updateUserRole
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    userController.deleteUser
  );

module.exports = router;
