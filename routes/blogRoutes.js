const express = require("express");
const authController = require("../controllers/authController");
const blogController = require("../controllers/blogController");
const cors = require("cors");
const router = express.Router();

const corsOptions = {
  credentials: true, //all the credentials like cookies ,sessions are allowed
  origin: true, // for public api //all the domains are allowed to call our api
  // origin: ["https://my-exams-ramkumargurav.vercel.app","https://snextjs-h3ruppdy0-ramkumargurav.vercel.app","http://localhost:3000"], // Add your frontend origin here (Don't add '/' at the end).
  methods: ["GET", "PATCH", "DELETE", "POST", "PUT", "HEAD", "OPTIONS"], //methods that are allowed in cors
  allowedHeaders: [
    //this headers are allowed
    "Origin",
    "X-CSRF-Token",
    "X-Requested-With",
    "Accept",
    "Accept-Version",
    "Content-Length",
    "Content-MD5",
    "Content-Type",
    "Date",
    "X-Api-Version",
    "Authorization",
    "Cookie",
    "Access-Control-Allow-Credentials",
    "Access-Control-Allow-Origin",
  ],
};
// app.use("*", cors(corsOptions)); // npm i cors
router.options("/blogs", cors());

router.route("/blogs").post(blogController.createBlog);

// GET ALL USERS
router.route("/blogs").get(blogController.getAllBlogs);

// UPDATE AND DELETE Blog
router
  .route("/blogs/:blogId")
  .get(blogController.getBlog)
  .patch(blogController.updateBlog)
  .delete(authController.isRouteProtected, blogController.deleteBlog);

module.exports = router;
