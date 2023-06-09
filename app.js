const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const favicon = require("serve-favicon");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");
const orderController = require("./controllers/orderController");

//--------Route iMPORTs------
const userRouter = require("./routes/userRoutes");
const questionRouter = require("./routes/questionRoutes");
const productRouter = require("./routes/productRoutes");
const packageRouter = require("./routes/packageRoutes");
const orderRouter = require("./routes/orderRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const postRouter = require("./routes/postRoutes");
const villaReservationRouter = require("./routes/villaReservationRoutes");
const villaPackageBookingRouter = require("./routes/villaPackageBookingRoutes");
const PortfolioMessageRouter = require("./routes/portfolioMessageRoutes");

const app = express();

//---------------------xxx-----------------------------------

//

app.enable("trust proxy");

const corsOptions = {
  credentials: true, //all the credentials like cookies ,sessions are allowed
  // origin: true, // for public api //all the domains are allowed to call our api//
  origin: [
    "https://my-exams-ramkumargurav.vercel.app",
    "https://myblogs-ramkumargurav.vercel.app",
    "https://royal-villas-ramkumargurav.vercel.app",
    "https://portfolio-ramkumargurav.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ],
  methods: "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE",
  allowedHeaders:
    "Access-Control-Allow-Headers,Access-Control-Allow-Origin, Origin,Accept,Authorization, X-Requested-With, Content-Type, Access-Control-Request-Method,stripe-signature, Access-Control-Request-Headers",

  // //--------------------------------------------------------
  // origin: [
  //   "https://my-exams-ramkumargurav.vercel.app",
  //   "https://snextjs-h3ruppdy0-ramkumargurav.vercel.app",
  //   "http://localhost:3000",
  // ], // Add your frontend origin here (Don't add '/' at the end).
  // methods: ["GET", "PATCH", "DELETE", "POST", "PUT", "HEAD", "OPTIONS"], //methods that are allowed in cors
  // allowedHeaders: [
  //   //this headers are allowed
  //   "Access-Control-Allow-Headers",
  //   "Origin",
  //   "Accept",
  //   "X-Requested-With",
  //   "Content-Type",
  //   "Access-Control-Request-Method",
  //   "Access-Control-Request-Headers",
  //   "X-CSRF-Token",
  //   "Accept-Version",
  //   "Content-Length",
  //   "Content-MD5",
  //   "Date",
  //   "X-Api-Version",
  //   "Authorization",
  //   "Cookie",
  //   "Access-Control-Allow-Credentials",
  //   "Access-Control-Allow-Methods",
  //   "Access-Control-Allow-Origin",
  // ],
  // //--------------------------------------------------------
};
app.options("*", cors(corsOptions)); // enabling preflight call
app.use("*", cors(corsOptions)); // npm i cors

//--------------------------------------------------------

app.use(cookieParser()); // To parse the incoming cookies

// app.use(
//   session({
//     secret: "keyboard cat",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false, sameSite: "none" },
//   })
// );

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  orderController.webhookCheckout
);

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

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// app.use(favicon(__dirname + "/public/images/favicon.ico"));
//--------------------------------------------------------
//
//--------------------------------------------------------
//------------routers--------------------------------
app.get("/", (req, res) => {
  res.send("Welcome to Our API.");
});
app.get("/favicon.ico", (req, res) => res.status(200)); //solving '/favicon.ico' error

app.use("/api/v1", userRouter);
app.use("/api/v1", questionRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", paymentRouter);
app.use("/api/v1", packageRouter);
app.use("/api/v1", postRouter);
app.use("/api/v1", villaReservationRouter);
app.use("/api/v1", villaPackageBookingRouter);
app.use("/api/v1", PortfolioMessageRouter);

//-----HANDLING UNHANDLED ROUTES---------------------------
app.use("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

//--------GLOBAL ERROR HANDLER----------------------------------
app.use(globalErrorHandler);

module.exports = app;
