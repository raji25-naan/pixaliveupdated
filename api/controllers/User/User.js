const moment = require("moment");
const Users = require("../../models/User/Users");
const followSchema = require("../../models/User/follow_unfollow");
const postSchema = require("../../models/User/Post");
const Hashtag = require("../../models/User/hashtags");
const bcrypt = require("bcrypt");
const {
  SendEmailVerificationLink,
} = require("../../helpers/UniversalFunctions");
const jwt = require("jsonwebtoken");
const { verifyGCMToken } = require("../../helpers/notification");
const twillio = require("../../helpers/smsManager");
let Twillio = new twillio();
const emailValidator = require("email-validator");


//signup
exports.signup = async (req, res, next) => {
  try {
    let {
      username,
      email,
      password,
      confirm_password,
      phone,
      first_name,
      last_name,
      avatar,
    } = req.body;
    const validEmail = emailValidator.validate(email);
    if (!validEmail) {
      return res.json({
        success: false,
        message: "Please enter valid email",
      });
    }
    const validPhoneno = phone;
    if (validPhoneno.length != 10) {
      return res.json({
        success: false,
        message: "Please enter valid phone number",
      });
    }
    let checkRegisterEmail = await Users.findOne({
      email: email,
      otp_verified: false,
    }).exec();
    if (checkRegisterEmail) {
      let otp = Math.floor(1000 + Math.random() * 9000);
      let otpExpirationTime = moment().add(5, "m");
      //updateOtp
      const updateOtp = await Users.findByIdAndUpdate(
        { _id: checkRegisterEmail._id },
        {
          $set: {
            otp: otp,
            otpExpirationTime: otpExpirationTime.toISOString(),
          },
        },
        { new: true }
      );
      Twillio.sendOtp(
        otp,
        checkRegisterEmail.country_code + checkRegisterEmail.phone
      );
      return res.json({
        success: true,
        user_id: checkRegisterEmail._id,
        message: "You are already registered with us! Please verify OTP.",
      });
    }
    let country_code = "+91";
    const userInfo = await Users.findOne({
      $or: [{ username: username }, { email: email }, { phone: phone }],
    });

    if (userInfo) {
      if (username.toLowerCase() == userInfo.username.toLowerCase()) {
        return res.json({
          success: false,
          message: "Username taken!",
        });
      } else if (email == userInfo.email) {
        return res.json({
          success: false,
          message: "Email already regitered!",
        });
      } else if (phone == userInfo.phone) {
        return res.json({
          success: false,
          message: "Phone number already regitered!",
        });
      }
      //checkPassword
      if (password != confirm_password) {
        return res.json({
          success: false,
          message: "Passwords must be the same!",
        });
      }
    } else {
      let otp = Math.floor(1000 + Math.random() * 9000);
      let otpExpirationTime = moment().add(5, "m");
      let userData = {
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 12),
        country_code: country_code,
        phone: phone,
        first_name: first_name,
        last_name: last_name,
        avatar: avatar,
        otp: otp,
        otp_verified: false,
        otpExpirationTime: otpExpirationTime.toISOString(),
        gcm_token: "",
        created_At: Date.now(),
      };

      const data = new Users(userData);
      const saveData = await data.save();
      if (saveData) {
        Twillio.sendOtp(otp, country_code + phone);
        // SendEmailVerificationLink(otp, req, saveData);
        return res.json({
          success: true,
          user_id: saveData._id,
          message: "OTP sent successfully to your Phone number"
        });
      } else {
        return res.json({
          success: false,
          message: "Error occured!" + error,
        });
      }
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!" + error,
    });
  }
};

//otpVerify
exports.verifyOtp = async (req, res, next) => {
  try {
    let { user_id, otp } = req.body;
    //getUserInfo
    const getUserInfo = await Users.findById({ _id: user_id });
    let otpExpirationTime = getUserInfo.otpExpirationTime;
    if (moment().isBefore(otpExpirationTime, "second")) {
      if (otp == getUserInfo.otp) {
        const updateData = await Users.findByIdAndUpdate(
          { _id: user_id },
          {
            $set: {
              otp: "",
              otp_verified: true,
              otpExpirationTime: "",
              isActive: true,
            },
          },
          { new: true }
        );
        if (updateData) {
          return res.json({
            success: true,
            message: "Account registered successfully!",
          });
        } else {
          return res.json({
            success: false,
            message: "Error occured!",
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Entered OTP is incorrect",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Entered OTP has been expired",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};

//resendOtp
exports.resendotp = async (req, res, next) => {
  try {
    let { user_id } = req.body;
    let otp = Math.floor(1000 + Math.random() * 9000);
    let otpExpirationTime = moment().add(5, "m");
    //checkOtpverified
    const checkOtpverified = await Users.findOne({
      _id: user_id,
      otp_verified: true,
    }).exec();
    if (checkOtpverified) {
      return res.json({
        success: false,
        message: "Your OTP was already verified!Please login",
      });
    }
    //findUserAndUpdate
    const findUserAndUpdate = await Users.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          otp: otp,
          otpExpirationTime: otpExpirationTime.toISOString(),
        },
      },
      { new: true }
    );
    if (findUserAndUpdate) {
      Twillio.sendOtp(
        otp,
        findUserAndUpdate.country_code + findUserAndUpdate.phone
      );
      // SendEmailVerificationLink(otp, req, findUserAndUpdate);
      return res.json({
        success: true,
        message: "New OTP sent successfully to your Mobile number",
      });
    } else {
      return res.json({
        success: false,
        message: "Error occured!",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};

//facebook_signin
exports.facebook_sign = async (req, res, next) => {
  try {
    let {
      username,
      email,
      password,
      confirm_password,
      phone,
      first_name,
      last_name,
      avatar,
    } = req.body;
    const validEmail = emailValidator.validate(email);
    if (!validEmail) {
      return res.json({
        success: false,
        message: "Please enter valid email",
      });
    }
    const validPhoneno = phone;
    if (validPhoneno.length != 10) {
      return res.json({
        success: false,
        message: "Please enter valid phone number",
      });
    }
    let checkRegisterEmail = await Users.findOne({
      email: email,
      otp_verified: false,
    }).exec();
    if (checkRegisterEmail) {
      let otp = Math.floor(1000 + Math.random() * 9000);
      let otpExpirationTime = moment().add(5, "m");
      //updateOtp
      const updateOtp = await Users.findByIdAndUpdate(
        { _id: checkRegisterEmail._id },
        {
          $set: {
            otp: otp,
            otpExpirationTime: otpExpirationTime.toISOString(),
          },
        },
        { new: true }
      );
      Twillio.sendOtp(
        otp,
        checkRegisterEmail.country_code + checkRegisterEmail.phone
      );
      return res.json({
        success: true,
        message: "You are already registered with us! Please verify OTP.",
      });
    }
    let country_code = "+91";
    const userInfo = await Users.findOne({
      $or: [{ username: username }, { email: email }, { phone: phone }],
    });

    if (userInfo) {
      if (username.toLowerCase() == userInfo.username.toLowerCase()) {
        return res.json({
          success: false,
          message: "Username taken!",
        });
      } else if (email == userInfo.email) {
        return res.json({
          success: false,
          message: "Email already regitered!",
        });
      } else if (phone == userInfo.phone) {
        return res.json({
          success: false,
          message: "Phone number already regitered!",
        });
      }
      //checkPassword
      if (password != confirm_password) {
        return res.json({
          success: false,
          message: "Passwords must be the same!",
        });
      }
    } else {
      // let otp = Math.floor(1000 + Math.random() * 9000);
      // let otpExpirationTime = moment().add(5, "m");
      let userData = {
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 12),
        country_code: country_code,
        phone: phone,
        first_name: first_name,
        last_name: last_name,
        avatar: avatar,
        // otp: otp,
        otp_verified: true,
        // otpExpirationTime: otpExpirationTime.toISOString(),
        gcm_token: "",
        created_At: Date.now(),
        facebook_signin: true,
        isActive: true
      };

      const data = new Users(userData);
      const saveData = await data.save();
      if (saveData) {
        // Twillio.sendOtp(otp, country_code + phone);
        // SendEmailVerificationLink(otp, req, saveData);
        return res.json({
          success: true,
          message: "Account registered successfully",
        });
      } else {
        return res.json({
          success: false,
          message: "Error occured!" + error,
        });
      }
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!" + error,
    });
  }
};

//login
exports.login = async (req, res, next) => {
  try {
    //changesByakeel
    let phone = req.body.email;
    let password = req.body.password;
    const data = await Users.findOne({ phone, otp_verified: true }).exec();
    if (data) 
    {
      if(data.isActive == false)
      {
        return res.status(401).json({
          success: false,
          statusCode: 499,
          message: "Your account is not active"
        })
      }
      const matched = await bcrypt.compare(password, data.password);
      if (!matched) {
        return res.json({
          success: false,
          message: "Invalid credentials!",
        });
      } else {
        const payload = {
          user: {
            id: data._id,
          },
        };
        const token = jwt.sign(payload, process.env.JWT_KEY, {
          expiresIn: "90d",
        });
        const decodedId = await jwt.verify(token, process.env.JWT_KEY);
        console.log(decodedId.user.id);
        if (token) {
          return res.json({
            success: true,
            user : {
              _id : data._id,
              username : data.username,
              first_name : data.first_name,
              last_name : data.last_name,
              email : data.email,
              phone : data.phone,
              avatar : data.avatar
            },
            token : token,
            message: "you have logged in successfully"
          });
        }
      }
    } else {
      return res.json({
        success: false,
        message: "you are not registered with us!",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};

// login with phone number
exports.login_phone = async (req, res, next) => {
  try {
    let { phone, password } = req.body;
    const data = await Users.findOne({ phone, otp_verified: true }).exec();
    if (data) {
      if(data.isActive == false)
      {
        return res.status(401).json({
          success: false,
          statusCode: 499,
          message: "Your account is not active"
        })
      }
      const matched = await bcrypt.compare(password, data.password);
      if (!matched) {
        return res.json({
          success: false,
          message: "Invalid credentials!",
        });
      } else {
        const payload = {
          user: {
            id: data._id,
          },
        };
        const token = jwt.sign(payload, process.env.JWT_KEY, {
          expiresIn: "90d",
        });
        if (token) {
          return res.json({
            success: true,
            user : {
              _id : data._id,
              username : data.username,
              first_name : data.first_name,
              last_name : data.last_name,
              email : data.email,
              phone : data.phone,
              avatar : data.avatar
            },
            token : token,
            message: "you have logged in successfully"
          });
        }
      }
    } else {
      return res.json({
        success: false,
        message: "you are not registered with us!",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};

//changePassword
exports.changepassword = async (req, res, next) => {
  try {
    const { oldpassword, newpassword, confirmpassword, user_id } = req.body;
    //getUserInfo
    const getUserInfo = await Users.findById({ _id: user_id });
    const matched = await bcrypt.compare(oldpassword, getUserInfo.password);

    if (!matched) {
      return res.json({
        success: false,
        message: "old password is incorrect",
      });
    } else {
      if (newpassword == confirmpassword) {
        const data = await Users.findByIdAndUpdate(
          { _id: user_id },
          {
            $set: { password: bcrypt.hashSync(newpassword, 12) },
          },
          { new: true }
        );
        if (data) {
          return res.json({
            success: true,
            message: "Password successfully changed!",
          });
        } else {
          return res.json({
            success: false,
            message: "Error occured!",
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Passwords are doesn't matched",
        });
      }
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};

//Get user info
exports.user_info = async (req, res, next) => {
  try
   {
    let user_id = req.user_id;
    let getUserInfo = await Users.findOne({ _id: req.query.id,isActive: true }).exec();
    let getUserPosts = await postSchema.find({user_id: getUserInfo._id,isActive: true}).populate("user_id","username first_name last_name avatar").exec();
    //getFriendslist
    const data_follower = await followSchema.distinct("followingId", {
      followerId: user_id,
    });
    const data_following = await followSchema.distinct("followerId", {
      followingId: user_id,
    });
    var array3 = data_follower.concat(data_following).map(String);
    var uniq_id = [...new Set(array3)];
      uniq_id.forEach((main_data) => {
        if (main_data == getUserInfo._id) {
          getUserInfo["follow"] = 1;
        }
      });
    var obj_set = {feeds: getUserPosts};
    const obj = Object.assign({}, getUserInfo._doc, obj_set);
    if (obj) 
    {
      return res.json({
        success: true,
        user : obj,
        message: "successfully fetched user information"
      });
    } else {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error Occured!!!" + error,
    });
  }
};

//is_user
exports.is_user = async (req, res, next) => {
  try {
    const getUserData = await Users.findOne({ phone: req.body.phone,isActive:true });
    if (getUserData) {
      return res.json({
        success: true,
        result: getUserData,
        message: "successfully fetched user information",
      });
    } else {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error Occured!!!" + error,
    });
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    let user_id = req.user_id;
    let editData = {};
    //checkOurData
    const myUserData = await Users.findOne({ _id: user_id });
    if (req.body.email || req.body.phone || req.body.username) {
      if (req.body.email !== undefined) {
        const validateEmail = emailValidator.validate(req.body.email);
        if (!validateEmail) {
          return res.json({
            success: false,
            message: "Please enter valid email",
          });
        }
        const userEmailDetail = await Users.findOne({ email: req.body.email });
        if (req.body.email == myUserData.email) {
          editData["email"] = req.body.email;
        } else if (userEmailDetail) {
          return res.json({
            success: false,
            message: "Email already regitered!",
          });
        }
      }

      // let validatePhone = req.body.phone;
      if (req.body.phone !== undefined) {
        if (req.body.phone.length != 10) {
          return res.json({
            success: false,
            message: "Please enter valid phone number",
          });
        }
        const userPhoneNoDetail = await Users.findOne({
          phone: req.body.phone,
        });
        if (req.body.phone == myUserData.phone) {
          editData["phone"] = req.body.phone;
        } else if (userPhoneNoDetail) {
          return res.json({
            success: false,
            message: "Phone Number already regitered!",
          });
        }
      }

      if (req.body.username !== undefined) {
        const userNameDetail = await Users.findOne({
          username: req.body.username,
        });
        if (
          req.body.username.toLowerCase() == myUserData.username.toLowerCase()
        ) {
          editData["username"] = req.body.username;
        } else if (userNameDetail) {
          console.log("taken");
          return res.json({
            success: false,
            message: "Username taken!",
          });
        }
      }
    }
    editData["phone"] = req.body.phone;
    editData["username"] = req.body.username;
    editData["first_name"] = req.body.first_name;
    editData["last_name"] = req.body.last_name;
    editData["avatar"] = req.body.avatar;
    editData["updated_At"] = Date.now();
    const updateData = await Users.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: editData,
      },
      { new: true }
    );
    if (updateData) {
      return res.json({
        success: true,
        result: updateData,
        message: "Profile updated successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Error occured" + error,
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured" + error,
    });
  }
};

exports.forgotpassword = async (req, res, next) => {
  try {
    let email = req.body.email;
    let getUserInfo = await Users.findOne({
      email: email,
      otp_verified: true,
    }).exec();
    if (getUserInfo) {
      let otp = Math.floor(1000 + Math.random() * 9000);
      let otpExpirationTime = moment().add(10, "m");
      const payload = {
        user: {
          id: getUserInfo._id,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_KEY, {
        expiresIn: "10m",
      });

      const data = await Users.findOneAndUpdate(
        { email: req.body.email },
        {
          $set: {
            otp: otp,
            otpExpirationTime: otpExpirationTime.toISOString(),
            passwordResetToken: token,
          },
        },
        { new: true }
      );
      if (data) {
        Twillio.sendOtp(otp, data.country_code + data.phone);
        // SendEmailVerificationLink(otp, req, data);
        return res.json({
          success: true,
          message: data.passwordResetToken
          // message: "OTP has been sent successfully",
        });
      } else {
        return res.json({
          success: false,
          message: "user not found",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "You are not registered with us!",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured" + error,
    });
  }
};

exports.resetPasswordVerifyOtp = async (req, res, next) => {
  try {
    var { token, otp } = req.body;
    const verifytoken = jwt.verify(token, process.env.JWT_KEY);
    let user_id = verifytoken.user.id;

    if (verifytoken) {
      const userdetails = await Users.findOne({ _id: user_id });
      if (otp == userdetails.otp) {
        const updatedetails = await Users.findByIdAndUpdate(
          { _id: user_id },
          {
            $set: {
              otp: "",
              otp_verified: true,
              otpExpirationTime: "",
            },
          },
          { new: true }
        );
        if (updatedetails) {
          return res.json({
            success: true,
            message: token
            // message: "OTP verified successfully",
          });
        } else {
          res.json({
            success: false,
            message: "Error occured" + error,
          });
        }
      } else {
        res.json({
          success: false,
          message: "Incorrect OTP",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "token expired",
      });
    }
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      return res.json({
        success: false,
        message: "Session expired, resend OTP",
      });
    } else {
      return res.json({
        success: false,
        message: "Error occured" + error,
      });
    }
  }
};

exports.resetpassword = async (req, res, next) => {
  try {
    let { token, password, confirmPassword } = req.body;
    const verifytoken = jwt.verify(token, process.env.JWT_KEY);
    let user_id = verifytoken.user.id;
    if (verifytoken) {
      if (password == confirmPassword) {
        const passwordUpdate = await Users.findByIdAndUpdate(
          { _id: user_id },
          {
            $set: {
              password: bcrypt.hashSync(password, 12),
              passwordResetToken: "",
            },
          },
          { new: true }
        );
        if (passwordUpdate) {
          return res.json({
            success: true,
            message: "Password changed successfully",
          });
        } else {
          return res.json({
            success: false,
            message: "Error occured" + error,
          });
        }
      } else {
        return res.json({
          success: false,
          message: "password must be the same",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "token expired",
      });
    }
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      return res.json({
        success: false,
        message: "Session expired, resend OTP",
      });
    } else {
      return res.json({
        success: false,
        message: "Error occured" + error,
      });
    }
  }
};

//updateGcmtoken
exports.gcm_token_updation = async (req, res, next) => {
  try {
    const { token, user_id } = req.body;
    const verifyToken = await verifyGCMToken(token);
    console.log(verifyToken);
    // if (error.name == "ReferenceError") {
    //   return res.json({
    //     success: false,y

    //     message: "registeration token is not valid",
    //   });awaitt
    // } else {
    const updateGcmtoken = await Users.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          gcm_token: token,
        },
      },
      { new: true }
    );
    if (updateGcmtoken) {
      return res.json({
        success: true,
        message: "gcm_token updated",
      });
    } else {
      return res.json({
        success: false,
        message: "Error",
      });
    }
    // }
  } catch (error) {
    // if (error.name == "ReferenceError") {
    //   return res.json({
    //     success: false,
    //     message: "registeration token is not valid",
    //   });
    // } else {
    return res.json({
      success: false,
      message: "Error occured" + error,
    });
  }
  // }
};

// search user
exports.search_user = async (req, res, next) => {
  try 
  {
    const search_user = req.query.search_user;
    const user_id = req.user_id;
    let reg = new RegExp(search_user);
    const all_users = await Users.find({username: reg,isActive: true}).exec();
    if (all_users.length > 0) {
      const data_follower = await followSchema.distinct("followingId", {
        followerId: user_id,
      });
      const data_following = await followSchema.distinct("followerId", {
        followingId: user_id,
      });
      var array3 = data_follower.concat(data_following).map(String);
      var uniq_id = [...new Set(array3)];
      console.log(uniq_id);
      all_users.forEach((data) => {
        uniq_id.forEach((main_data) => {
          if (main_data == data._id) {
            data["follow"] = 1;
          }
        });
      });
      return res.json({
        success: true,
        result: all_users
      });
    } else {
      return res.json({
        success: false,
        message: "user not found ",
      });
    }

      
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

// search place
exports.search_place = async (req, res, next) => {

  try 
  {    
    const search = req.query.place;
    const user_id = req.user_id;
    var reg = new RegExp(search);
    const get_place = await postSchema.find({ place: reg , isActive:true}).exec();
    if (get_place.length>0) 
    {
      const data_follower = await followSchema.distinct("followingId", {
        followerId: user_id,
      });
      const data_following = await followSchema.distinct("followerId", {
        followingId: user_id,
      });
      var array3 = data_follower.concat(data_following).map(String);
      var uniq_id = [...new Set(array3)];
      console.log(uniq_id);
      get_place.forEach((postdata) => {
        uniq_id.forEach((following_id) => {
          if (following_id == postdata.user_id) {
            postdata["follow"] = 1;
          }
        });
      });
      return res.json({
        success: true,
        feeds: get_place,
      });
    }
    else
    {
      return res.json({
        success: false,
        message: "No data found"
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

// upload avatar in user schema
exports.upload_avatar = async (req, res, next) => {
  try 
  {
    console.log(req.files);
    const file = req.files.photo;
    const user_id = req.user_id;
    console.log(file.originalname);
    console.log(file);
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      file.mv("./profile_avatar/" + file.name, async function (err, result) {
        if (err) throw err;
        const getUserInfoAndUpdate = await Users.findByIdAndUpdate(
          { _id: user_id },
          {
            $set: { avatar: file.name },
          },
          { new: true }
        );
        res.send({
          success: true,
          message: "File uploads",
        });
      });
    } else {
      return res.json({
        success: false,
        message: "Only jpeg and png are accepted !!" + error,
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

// update avatar in user schema

exports.change_avatar = async (req, res, next) => {
  try {
    const file = req.files.photo;
    const user_id = req.user_id;
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      file.mv("./profile_avatar/" + file.name, async function (err, result) {
        if (err) throw err;
        const getUserInfoAndUpdate = await Users.findByIdAndUpdate(
          { _id: user_id },
          {
            $set: { avatar: file.name },
          },
          { new: true }
        );
        res.send({
          success: true,
          message: "File uploads",
        });
      });
    } else {
      return res.json({
        success: false,
        message: "Only jpeg and png are accepted !!" + error,
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

exports.search = async (req, res, next) => {
  try {
    const user_id = req.user_id;
    const search_user = req.query.search_user;
    const search_hashtag = req.query.search_hashtag;
    const search_category = req.query.search_category;
    if (search_user) {
      let reg = new RegExp(search_user);
      const all_users = await Users.find({ username: reg,isActive: true}).exec();
      if (all_users.length > 0) {
        const data_follower = await followSchema.distinct("followingId", {
          followerId: user_id,
        });
        const data_following = await followSchema.distinct("followerId", {
          followingId: user_id,
        });
        var array3 = data_follower.concat(data_following).map(String);
        var uniq_id = [...new Set(array3)];
        console.log(uniq_id);
        all_users.forEach((data) => {
          uniq_id.forEach((main_data) => {
            if (main_data == data._id) {
              data["follow"] = 1;
            }
          });
        });
        return res.json({
          success: true,
          result: all_users
        });
      } else {
        return res.json({
          success: false,
          message: "user not found ",
        });
      }
    } else if (search_hashtag) 
    {
      let reg = new RegExp(search_hashtag);
      const getHashtags = await Hashtag.find({ hashtag: reg });
      if (getHashtags.length > 0) {
        let userFollowedHashtagList = await Users.distinct(
          "followedHashtag._id",
          { _id: user_id }
        ).exec();
        userFollowedHashtagList = userFollowedHashtagList.map(String);
        var followedHashtagId = [...new Set(userFollowedHashtagList)];
        getHashtags.forEach((data) => {
          followedHashtagId.forEach((hashId) => {
            console.log(hashId == data._id);
            if (hashId == data._id) {
              data["follow"] = 1;
            }
          });
        });
        return res.json({
          success: true,
          result: getHashtags
        });
      } else {
        return res.json({
          success: false,
          message: "hashtag not found ",
        });
      }
    }
    else if(search_category)
    {
      let reg = new RegExp( search_category);
      const getPosts = await postSchema.find({category: reg,isActive: true}).exec();
      if(getPosts.length>0)
      {
        const data_follower = await followSchema.distinct("followingId", {
          followerId: user_id,
        });
        const data_following = await followSchema.distinct("followerId", {
          followingId: user_id,
        });
        var array3 = data_follower.concat(data_following).map(String);
        var uniq_id = [...new Set(array3)];
        console.log(uniq_id);
        getPosts.forEach((data) => {
          uniq_id.forEach((main_data) => {
            if (main_data == data.user_id) {
              data["follow"] = 1;
            }
          });
        });
        return res.json({
          success: true,
          result: getPosts
        });
      }
      else
      {
        return res.json({
          success: false,
          message: "No data found"
        });
      }
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};
