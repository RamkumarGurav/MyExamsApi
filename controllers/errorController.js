const AppError = require("../utils/AppError");

const sendErrorDev = (err, req, res) => {
  console.error("ERROR 🔥", err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
//--------------------------------------------------------

//--------------------------------------------------------
const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    console.error("ERROR 🔥", err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 🔥", err);
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong",
    });
  }
};
//--------------------------------------------------------

//---------------------------------------------------------
// Creating Production Error messages

const handleCastErrorDb = (err) => {
  const message = `Resource not Found.Invalid ${err.path}:${err.value}`; //'Resource not Found. Invalid _id:xxxxxadf
  return new AppError(message, 400); //400- bad request
};
//---completer cast error in devlopment mode----
//   {
//     "status": "error",
//     "message": "Cast to ObjectId failed for value \"xxxxx9b2ee470\" (type string) at path \"_id\" for model \"Product\"",
//     "stack": "CastError: Cast to ObjectId failed for value \"xxxxx9b2ee470\" (type string) at path \"_id\" for model \"Product\"\n    at model.Query.exec (C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongoose\\lib\\query.js:4913:21)\n    at Query.then (C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongoose\\lib\\query.js:5012:15)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
//     "error": {
//         "stringValue": "\"xxxxx9b2ee470\"",
//         "valueType": "string",
//         "kind": "ObjectId",
//         "value": "xxxxx9b2ee470",
//         "path": "_id",
//         "reason": {},
//         "name": "CastError",
//         "message": "Cast to ObjectId failed for value \"xxxxx9b2ee470\" (type string) at path \"_id\" for model \"Product\""
//     }
// }
// //--------------------------------------------------------

// //--------------------------------------------------------
const handleDuplicateFieldsErrorDb = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/); //finding value of entered field which is between quotes in errmsg
  const message = `Duplicate field value:${value} Please use another value!`; //eg-"Duplicate field value:\"email:user5@gmail.com\" Please use another value!"
  // const message=`Duplicate ${object.keys(err.keyValue)} Entered`//eg-"Duplicate email Entered"
  return new AppError(message, 400); //400- bad request
};

//---completer duplicateField  error in devlopment mode--------
// {
//   "status": "error",
//   "message": "E11000 duplicate key error collection: blipkart.users index: email_1 dup key: { email: \"user5@gmail.com\" }",
//   "stack": "MongoServerError: E11000 duplicate key error collection: blipkart.users index: email_1 dup key: { email: \"user5@gmail.com\" }\n    at C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongodb\\lib\\operations\\insert.js:53:33\n    at C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongodb\\lib\\cmap\\connection_pool.js:333:25\n    at C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongodb\\lib\\sdam\\server.js:212:17\n    at handleOperationResult (C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongodb\\lib\\sdam\\server.js:328:20)\n    at Connection.onMessage (C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongodb\\lib\\cmap\\connection.js:239:9)\n    at MessageStream.<anonymous> (C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongodb\\lib\\cmap\\connection.js:60:60)\n    at MessageStream.emit (node:events:513:28)\n    at processIncomingData (C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongodb\\lib\\cmap\\message_stream.js:125:16)\n    at MessageStream._write (C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongodb\\lib\\cmap\\message_stream.js:33:9)\n    at writeOrBuffer (node:internal/streams/writable:392:12)",
//   "error": {
//       "index": 0,
//       "code": 11000,
//       "keyPattern": {
//           "email": 1
//       },
//       "keyValue": {
//           "email": "user5@gmail.com"
//       },
//       "statusCode": 500,
//       "status": "error"
//   }
// }
// //--------------------------------------------------------

// //--------------------------------------------------------
const handleValidationErrorDb = (err) => {
  // const values = err.message;
  const errorsMsg = Object.values(err.errors)
    .map((el) => el.message)
    .join(". ");
  const message = `Invalid input Data. ${errorsMsg}`;
  return new AppError(message, 400); //400- bad request
};

//---completer Validation  error in devlopment mode--------
// {
//   "status": "error",
//   "message": "User validation failed: email: Enter valid email, role: `customer` is not a valid enum value for path `role`., passwordConfirm: Password must match",
//   "error": {
//       "errors": {
//           "email": {
//               "name": "ValidatorError",
//               "message": "Enter valid email",
//               "properties": {
//                   "message": "Enter valid email",
//                   "type": "user defined",
//                   "path": "email",
//                   "value": "user.com"
//               },
//               "kind": "user defined",
//               "path": "email",
//               "value": "user.com"
//           },
//           "role": {
//               "name": "ValidatorError",
//               "message": "`customer` is not a valid enum value for path `role`.",
//               "properties": {
//                   "message": "`customer` is not a valid enum value for path `role`.",
//                   "type": "enum",
//                   "enumValues": [
//                       "admin",
//                       "user"
//                   ],
//                   "path": "role",
//                   "value": "customer"
//               },
//               "kind": "enum",
//               "path": "role",
//               "value": "customer"
//           },
//           "passwordConfirm": {
//               "name": "ValidatorError",
//               "message": "Password must match",
//               "properties": {
//                   "message": "Password must match",
//                   "type": "user defined",
//                   "path": "passwordConfirm",
//                   "value": "assdfasdf"
//               },
//               "kind": "user defined",
//               "path": "passwordConfirm",
//               "value": "assdfasdf"
//           }
//       },
//       "_message": "User validation failed",
//       "statusCode": 500,
//       "status": "error",
//       "name": "ValidationError",
//       "message": "User validation failed: email: Enter valid email, role: `customer` is not a valid enum value for path `role`., passwordConfirm: Password must match"
//   },
//   "stack": "ValidationError: User validation failed: email: Enter valid email, role: `customer` is not a valid enum value for path `role`., passwordConfirm: Password must match\n    at Document.invalidate (C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongoose\\lib\\document.js:3125:32)\n    at C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongoose\\lib\\document.js:2913:17\n    at C:\\Users\\RAM\\Desktop\\MERN\\blipkart\\server\\node_modules\\mongoose\\lib\\schematype.js:1349:9\n    at process.processTicksAndRejections (node:internal/process/task_queues:77:11)"
// }
//---------Validation error in prod-------------------
// {
//   "status": "fail",
//   "message": "Invalid input Data. Enter valid email. `customer` is not a valid enum value for path `role`.. Password must match"
// }

//--------------------------------------------------------

//--------------------------------------------------------
const handleJWTError = () => {
  return new AppError("Invalid JWT token.Please login again", 401);
};

//--------------------------------------------------------

//--------------------------------------------------------
const handleJWTExpiredError = () => {
  return new AppError(
    "Your JWT token has been expired.Please login again",
    401
  );
};

//--------------------------------------------------------

//--------------------------------------------------------

//------------GLOBAL ERROR HANDLER--------------------------------------------

module.exports = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    let prodError = { ...err };
    prodError.message = err.message;
    //5 types of errors
    //--------------------------------------------------------
    if (err.name === "CastError") {
      // the error message means that it can't create an ObjectID from your request body//http://localhost:5000/api/v1/products/xxxxx9b2ee47---//here 'xxxxx9b2ee47' supposed to be a mongodb ID but its not an id that follows mongodb id structure/styntax  thats why mongodb gives castError
      prodError = handleCastErrorDb(err);
    }
    //--------------------------------------------------------
    // for Mango errors where a alredy existing field (eg-name or email) is  entered again -duplicate key error
    if (err.code === 11000) {
      prodError = handleDuplicateFieldsErrorDb(err);
    }
    //--------------------------------------------------------
    // //for ValidationErrors where validation conditions are not met like giving 6 as ratingsAverage
    if (err.name === "ValidationError") {
      prodError = handleValidationErrorDb(err);
    }
    //--------------------------------------------------------
    if (err.name === "JsonWebTokenError") {
      //error if token has differen payload (id)
      prodError = handleJWTError(err);
    }
    //--------------------------------------------------------
    if (err.name === "TokenExpiredError") {
      //error if token is expired
      prodError = handleJWTExpiredError(err);
    }
    //--------------------------------------------------------

    sendErrorProd(prodError, req, res);
  }
};
