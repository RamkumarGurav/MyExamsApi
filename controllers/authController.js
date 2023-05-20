const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
// const cloudinary = require("cloudinary");

const handlerFactory = require("./handlerFactory");

const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const Email = require("../utils/Email");
const User = require("../models/userModel");
//--------------------------------------------------------

// Creating JWT token

const signToken = (id) => {
  //creating jwt token
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
//--------------------------------------------------------

// Sending jwt token to server via cookies
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  //--------------dev mode------------------------------------------
  const cookieOptions = {
    //here'jwt' is the name of the cookie and 'token' is the data is inside this cookie
    //new Date(12357890(present time in ms)+JWT_COOKIE_EXPIRES_IN *1day)=Tue Feb 14 2023 07:58:12 GMT+0530 (India Standard Time)
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), //browser will delete this cookie after 90 days
    secure: false, //if secure is true then this cookie will be sent through only https connection (encrpted connect)
    httpOnly: true, //this makes- this cookie can't be access or modified by the browser.or even browser cant delete this cookie//this makes the browser only store the cookie and send it along request every time a request made to the website server(where cookie originally created )
  };

  // if (process.env.NODE_ENV === 'production') {
  //   cookieOptions.secure = true; //making secure true in production mode bcz we use https in production during development we use http
  // }
  //---------------------PROD-----------------------------------
  // const cookieOptions = {
  //   //here'jwt' is the name of the cookie and 'token' is the data is inside this cookie
  //   //new Date(12357890(present time in ms)+JWT_COOKIE_EXPIRES_IN *1day)=Tue Feb 14 2023 07:58:12 GMT+0530 (India Standard Time)
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  //   ), //browser will delete this cookie after 90 days
  //   secure: req.secure || req.headers["x-forwarded-proto"] === "https", //if secure is true then this cookie will be sent through only https connection (encrpted connect)
  //   httpOnly: true, //this makes- this cookie can't be access or modified by the browser.or even browser cant delete this cookie//this makes the browser only store the cookie and send it along request every time a request made to the website server(where cookie originally created )
  // };
  //--------------------------------------------------------

  //attaching cookie to response object
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined; //making password hidden in the output //even though we made selet false for password inside schema ,for signup, password is showing due to Create method

  //sending response
  res.status(statusCode).json({
    //201-created
    status: "success",
    token,
    data: {
      user,
    },
  });
};
//--------------------------------------------------------

//----------------REGISTRATION----------------------------------------
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, passwordConfirm, avatar, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    avatar,
    role,
    // avtar: { public_id: "this is public id", url: "this is url" },
  });

  //----sending welcome email -------
  //---creating account even if the email is failed to send ----------
  try {
    const url = `${req.protocol}://${req.get("host")}/me`;
    const message = `Hi ${user.name}, Welcome to BlipKart Family.\n\nVisit ${url} to change your account settings and update user profile photo`;
    await new Email(user, message).sendWelcome();
  } catch (err) {
    createSendToken(user, 200, req, res);
  }

  createSendToken(user, 201, req, res);
});
//--------------------------------------------------------

//---------------LOGIN-------------------------------------
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  //IMPstep1) we check if email and password exist in the inputted body if they exit then move to step2
  if (!email || !password) {
    return next(new AppError("Pleases provide email and password!", 400)); //400-bad request
  }
  //IMPstep2)checking if user exist by chicking whether given email exists in users collection then if the inputted password is compared with the  userpassword that is stored data base-if both matches then move to step3 and  create token and send it to client
  const user = await User.findOne({ email: email }).select("+password"); ///user document which includes password as a field -because in user model we made select as false for password to not show in output

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    //if there is no user exists in DB or password is incorrect then give error else move to step3
    return next(new AppError("Invalid email or password", 401)); //401-unathorised
  }

  //IMPstep3)if everything is ok then send token to client
  createSendToken(user, 200, req, res);
});
//--------------------------------------------------------

//------------------------PROTECTING ROUTE------------------
//middleware for checking whether given route is protected or not ,if it is protected then control moves to next middleware else it gives an error which is handled by global error handler
//here we check whether route is protected by verifying the jwt token that is provided to user(which is passed in the headers of the request) is same as the jwt token issued to to the user when he is logged in
exports.isRouteProtected = catchAsyncErrors(async (req, res, next) => {
  //IMPstep1)checking the token exits and getting it
  //Checking whether there is a token in the req.headers authorization fields which starts with 'Bearer' word //then get that token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; //jwt token that is sent in headers authorization field
  } else if (req.cookies.jwt) {
    //if there is jwt in cookie
    token = req.cookies.jwt;
  }

  if (!token) {
    //if there is no token in the req,  means user is not logged in and error is generated
    return next(
      new AppError("You are not logged in! Please login to get access", 401)
    );
  }

  //IMPstep2)verifing the given token
  //in this -given jwt token is compared with the token that is issued to the loggedin user(original jwt token that is given to the user) -if user is different other than logged in user- it means it contains different payload(ie-different id) then it gives error
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //this gives the object that contains id of the user(payload) ,iat:timestamp in seconds when origianl jwt is created and jwt tokens expiration time ,Eg-{ id: '63e062a014de4fc239c6c5ec', iat: 1675649697, exp: 1683425697 }//if there this verification fails then it is catched/handled globalerror handler

  //IMPstep3)check if the user that is mentioned in given jwt token still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }

  //IMPstep4)check if user changed password after the token was issued
  if (currentUser.isPasswordChangedAfterJwtIssued(decoded.iat)) {
    return next(
      new AppError("User recently changed password! please login again", 401)
    );
  }

  //IMPstep5) grant access to protected route
  req.user = currentUser; //storing currentuser in req.user which may be used next middleware in future eg-it is used in restrictedTo middlware to get current user's role
  next(); //if route is protected then move to next middleware which getAllTours
});

//--------------------------------------------------------

//--------------LOGOUT------------------------------------
//whenever user hitts logut route of api we send him a cookie which as same name as 'jwt' which actually stores the jwt token but in this cookie we will store normal text(here-'random text') instead of jwt token when browser reloads and sends this normal text to server then server fails to verify it and login fails and it moves to homepage
exports.logout = (req, res, next) => {
  //attaching cookie to response object
  //here we store normal text(here-'logout') inside the cookie named 'jwt'
  res.cookie("jwt", "random text", {
    expires: new Date(Date.now() + 1000), //1 seconds lifetime
    secure: false,
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logged out",
  });
};
//--------------------------------------------------------

//------------------------AUTHORIZATION--------------------
//
//middleware function that only allows 'admon' to use given route
exports.restrictTo = (...roles) => {
  //here we return middleware function inside the wrapper funciton because we cant pass arguements(roles) inside middleware funciton //here roles=['admin','user']//by doing this we can use roles inside middleware function
  return catchAsyncErrors(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      //if the current user's role is not included in the  roles array then he is not allowed to move to next middleware-which means if the user is not 'admin' then dont allow the user  to move to next middleware
      return next(
        new AppError("You do not have permission to perform this action", 403) //403-forbidden
      );
    }
    next();
  });
};
//--------------------------------------------------------

//--------FORGOT PASSWORD AND PASSWORD RESET-----------------
//FORGOT PASSWORD AND PASSWORD RESET-when u provide your email adress application will send u an url link where u can update new password

//FORGOT PASSWORD and sending email with password reset link
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  //step1)get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }
  //step2)generate simple random token using builtin crypto module and save to user doc
  const resetToken = user.createPasswordResetToken(); //plain token
  await user.save({ validateBeforeSave: false }); //saving because in the above common document instance method we added new data to encryptedPasswordResetToken and passwordResetTokenExpires fields//here we set validateBeforeSave:false to not run validators during this save because else it gives errors like name ,email.... required like

  //step3)send the token along with the reset url to users email

  //sending email to users email also handling error if sending fails
  try {
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    const message = `Your password reset token is :-\n\n${resetPasswordUrl}\n\nYour password reset token Valid for only 10 minutes\n\nIf you have not requested this email then Please ignore it`;

    await new Email(user, message).sendResetPasswordUrl();

    res.status(200).json({
      status: "success",
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (err) {
    //destroying token if there is error while sending email
    user.encryptedPasswordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false }); //saving because in the above we added new data of undefined to encryptedPasswordResetToken and passwordResetTokenExpires fields//here we set validateBeforeSave:false to not run validators during this save because else it gives errors like name ,email.... required..
    return next(
      new AppError(
        "There was an error while sending the email.Try agian later",
        500
      )
    );
  }
});
//--------------------------------------------------------
//RESET PASSWORD
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  //step1)Get user based on the token
  //here we create the encrpted token using plain token that is present in req.params.token and then we search the user by that encrpted token
  const encryptedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    //searching user along with checking if the generated token is expired or not(if the passwordResetTokenExpires is greater than the present time in this situation then it means that it is not expired )
    encryptedPasswordResetToken: encryptedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  //step2)if token has not expired and there is user ,set the new password and clear the previous token
  if (!user) {
    return next(new AppError("Token is Invalid or has expired ", 400)); //400-badrequest
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.encryptedPasswordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save(); //here we need validators to run confirm password function thats why we didnot use validateBeforeSave: false
  //note- for all password related operation first use findOne method then use .save()method dont use .findOneUpdate() method directly

  //step3)Update the passwordChangedAt property for the current user
  //->done using document presave middlware

  //step4)Loggin the user by sending him the jwt token
  createSendToken(user, 200, req, res);
});
//--------------------------------------------------------

//---------------UPDATE PASSWORD BY LOGGED IN USER-------------------
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  //step1)get user from the collection
  const user = await User.findById(req.user.id).select("+password"); //req.user is from previous middleware which is isRouteProtected//here we will get the current users data including password propery (sinnce we made password unavalaible in the output by defining on schema)(by doing this -select('+password'))(it is encrypted)
  //User.findByIDAndUpdate()method is not used becasue if we use this document pre-save middlwares and validtion for passwordConfirm doesnt work -becasue they cant have access to 'this'keyword which is current document//thats why we use User.findById() and then later we use User.save() method(used in step3)

  //step2)check if posted current password is correct
  if (
    !(await user.isPasswordCorrect(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError("Your current password is wrong", 400));
  }

  //step3)if so update password
  //updating password and confirmpassword fields
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); //here we need validators to run confirm password function thats why we didnot use validateBeforeSave: false
  //note- for all password related operation first use findOne method then use .save()method dont use .findOneUpdate() method directly

  //step3)log user in ,send jwt token
  createSendToken(user, 200, req, res);
});
//-------------------------------------------------
