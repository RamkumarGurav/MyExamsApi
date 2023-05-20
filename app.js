const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");

//--------Route iMPORTs------
const userRouter = require("./routes/userRoutes");
const questionRouter = require("./routes/questionRoutes");
const productRouter = require("./routes/productRoutes");
const packageRouter = require("./routes/packageRoutes");
const orderRouter = require("./routes/orderRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const blogRouter = require("./routes/blogRoutes");

const app = express();

//---------------------xxx-----------------------------------
//--------------------------------------------------------
//------------middleware--------------------------------------------
//Implementing CORS -Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources.
//this enables other websites to access our api
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   })
// );
//it adds some headers//"'Access-conterol-allow-origin':*"-->Access-conterol-allow-origin header set to everything
//if our api(backend) is at 'https://api.natours.com' and our frontend at 'https://natours.com' then we need to set origin as frontend url in cors in our app
//app.use(cors({origin:'https://natours.com'}))

//enabling cors for all the routes in our app //here 'options' is a http method just like get,post..which is executed before real http method is executed this method asks server whether next next real http method is safe or not - so here this is enabled for all the routes so that 'delete','patch' and 'put' methods are made saf and allowed
app.use(cookieParser()); // To parse the incoming cookies
const corsOptions = {
  credentials: true,
  origin: "http://localhost:300", // Add your frontend origin here (Don't add '/' at the end)
};
app.use("*", cors(corsOptions)); // npm i cors
// app.use(
//   session({
//     secret: "keyboard cat",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false, sameSite: "none" },
//   })
// );
//Body parser middlware
app.use(express.json({ limit: "50mb" })); //middleware for reading data from the body into req.body//here if body contains more than 10kb of data then it will not read

//this middle helps when we want directly submit our data using form to the url using acton and method -this helps in  parsing submitted data so that value is stored with name of 'name'(of input) property
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

//---------------------xxx-----------------------------------

// //--------------------------------------------------------
// //------------middleware--------------------------------------------
// //Implementing CORS -Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources.
// //this enables other websites to access our api
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// ); //it adds some headers//"'Access-conterol-allow-origin':*"-->Access-conterol-allow-origin header set to everything
// //if our api(backend) is at 'https://api.natours.com' and our frontend at 'https://natours.com' then we need to set origin as frontend url in cors in our app
// //app.use(cors({origin:'https://natours.com'}))

// //enabling cors for all the routes in our app //here 'options' is a http method just like get,post..which is executed before real http method is executed this method asks server whether next next real http method is safe or not - so here this is enabled for all the routes so that 'delete','patch' and 'put' methods are made saf and allowed
// app.options("*", cors());
// app.use(
//   session({
//     secret: "keyboard cat",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false, sameSite: "none" },
//   })
// );
// //Body parser middlware
// app.use(express.json({ limit: "50mb" })); //middleware for reading data from the body into req.body//here if body contains more than 10kb of data then it will not read

// //this middle helps when we want directly submit our data using form to the url using acton and method -this helps in  parsing submitted data so that value is stored with name of 'name'(of input) property
// app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// // app.use(cookieParser());
// // app.use(bodyParser.urlencoded({ extended: true }));
// // app.use(fileUpload());

// app.use(cookieParser()); // To parse the incoming cookies
// const corsOptions = {
//   credentials: true,
//   origin: "http://localhost:3000", // Add your frontend origin here (Don't add '/' at the end)
// };
// app.use("*", cors(corsOptions)); // npm i cors

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//--------------------------------------------------------
//
//--------------------------------------------------------
//------------routers--------------------------------
app.get("/", (req, res) => {
  res.send("Welcome to MyExams Api");
});

app.use("/api/v1", userRouter);
app.use("/api/v1", questionRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", paymentRouter);
app.use("/api/v1", packageRouter);
app.use("/api/v1", blogRouter);

//-----HANDLING UNHANDLED ROUTES---------------------------
app.use("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

//--------GLOBAL ERROR HANDLER----------------------------------
app.use(globalErrorHandler);

module.exports = app;
