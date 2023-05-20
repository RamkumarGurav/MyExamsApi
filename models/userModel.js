const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter user name"],
      trim: true,
      maxlength: [50, "name must contain less than 50 characters"],
      minlength: [2, "name must contain more than 2 characters"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Please enter user email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Enter valid email"],
    },
    // phone: {
    //   type: Number,
    //   required: [true, "Please enter user phonenumber"],
    // },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    // avtar: {
    //   public_id: {
    //     type: String,
    //     required: true,
    //   },
    //   url: {
    //     type: String,
    //     required: true,
    //   },
    // },
    avatar: {
      type: String,
      default: "/Profile6.jpg",
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
      minlength: [8, "password must contain atleast 8 characters"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please enter confirmPassword"],
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: "Passwords must match",
      },
    },
    passwordChangedAt: Date, //  date when password is changed/updated
    encryptedPasswordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false, //not visible in the output only visible in DB
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//-----------------------------------------------------------------

//--------------------------------------------------------
//--PASSWORD ENCRYPTINNG & REMOVING PASSWORDCONFIRM FIELD----------
//encrpting password and removing the passwordconfirm field in database using bcryptjs package Using document pre-save middleware-
//note that when you're using findAndUpdate() method, the pre-save hook/middleware is not triggered
userSchema.pre("save", async function (next) {
  //// Only run this function if password field was actually moddified(during password reset and password update) or created new(initial signup)(also it will  not run when other fields like name and emails are modified)
  //if password is not modified then dont encrypt password, move to next middleware
  //only encrpt passowrd and place undefine in passwordConfirm field When a new password is created or when it is updated
  if (!this.isModified("password")) {
    //eg-we dont want to hash password again if we only update name so thats why if the password is not updated along when updating the other fields then skip this middleware and move to next middleware
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12); //here 12 is castParameter which is best
  this.passwordConfirm = undefined; //removing the confirm field in database
  next();
});
//-----------------------------------------------------------------

//-----------------------------------------------------------------
//creating a common document method(also called as instance method) on all the documents of user collection-so that we can access isPasswordCorrect method whenever we get any user document
userSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  userPasswordStoredInDB
) {
  return await bcrypt.compare(candidatePassword, userPasswordStoredInDB); //comparing un encrypted passowrd(candidate password) with encrpted password-in this bcrypt automatically encrypts candidatepassword and compares it with userpassword
};
//-----------------------------------------------------------------

//-----------------------------------------------------------------
userSchema.methods.isPasswordChangedAfterJwtIssued = function (JWTTimestamp) {
  //every common document method(also called as instance method) has access to 'this' which gives the current document in that route
  if (this.passwordChangedAt) {
    const passwordChangedAtInSec = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); //converting date string into integer seconds ,bcz JWTTimestamp is always in seconds--parseInt(value,baseValue)
    // console.log(passwordChangedAtInSec, JWTTimestamp);
    //if date value is bigger then it means it is more recent date
    //here true means password is changed ,false meeans not changed
    return JWTTimestamp < passwordChangedAtInSec; //here if the passwordChangedAtInSec is bigger than  JWTTimestamp-means passwordChangedAtInSec is more recent date than JWTTimestamp -which means password is changed but token is still old one (no token generated for new password) so we need to login again//if the passwordChangedAtInSec is smaller than  JWTTimestamp-means passwordChangedAtInSec is more older date than JWTTimestamp -which means no new password is changed or created
  }
  //by default we return false
  //Here false means password is not changed after jwt is created
  return false;
};
//--------------------------------------------------------

//--------------------------------------------------------
//creating reset token - we store encrypted resetToken inside the database and send plain resetToken to user's email while resetting password we again encrpt users plain resetToken with the already storen encrpted resetToken
userSchema.methods.createPasswordResetToken = function () {
  //plain reset token
  const resetToken = crypto.randomBytes(32).toString("hex"); //creating 32 characters long random token//key-crpto crt
  //encrypted reset token
  this.encryptedPasswordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex"); //key-crpto ccud

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; //adding 10mins exporation time when resetToken is created//then resetToken is valid for 10mins

  // console.log(resetToken, this.encryptedPasswordResetToken);
  return resetToken; //we use this in forgotpassword middleware
};
const User = mongoose.model("User", userSchema);

module.exports = User;
