const moment = require("moment");
const Users = require("../../models/User/Users");
const followSchema = require("../../models/User/follow_unfollow");
const Hashtag = require("../../models/User/hashtags");
const bcrypt = require("bcrypt");
const { SendEmailVerificationLink } = require("../../helpers/UniversalFunctions");
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
    if(!validEmail)
    {
      return res.json({
        success: false,
        message: "Please enter valid email"
      });
    }
    const validPhoneno = phone;
    if(validPhoneno.length != 10)
    {
      return res.json({
        success: false,
        message: "Please enter valid phone number"
      });
    }
    let checkRegisterEmail = await Users.findOne({email:email,otp_verified: false}).exec();
    if(checkRegisterEmail)
    {
      let otp = Math.floor(1000 + Math.random() * 9000);
      let otpExpirationTime = moment().add(5, "m");
      //updateOtp
      const updateOtp = await Users.findByIdAndUpdate(
        {_id : checkRegisterEmail._id},
        {
          $set : {
            otp : otp,
            otpExpirationTime : otpExpirationTime.toISOString()
          }
        },{new : true}
      );
      Twillio.sendOtp(otp, checkRegisterEmail.country_code + checkRegisterEmail.phone);
      return res.json({
        success: true,
        message: "You are already registered with us! Please verify OTP."
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
          message: "OTP sent successfully to your Phone number",
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
    const checkOtpverified = await Users.findOne({_id:user_id,otp_verified:true}).exec();
    if(checkOtpverified)
    {
      return res.json({
        success: false,
        message: "Your OTP was already verified!Please login"
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
    if (password != confirm_password) {
      return res.json({
        success: false,
        message: "Passwords must be the same!",
      });
    }

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
    } else {
      let userData = {
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 12),
        country_code: "+91",
        phone: phone,
        first_name: first_name,
        last_name: last_name,
        otp_verified: true,
        avatar: avatar,
        gcm_token: "",
        created_At: Date.now(),
        facebook_signin: true,
      };

      const data = new Users(userData);
      const saveData = await data.save();
      if (saveData) {
        return res.json({
          success: true,
          message: "Account registered! You can now login from same email.",
        });
      } else {
        return res.json({
          success: false,
          message: "Error occured!",
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

//login
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    const data = await Users.findOne({ email, otp_verified: true }).exec();
    if (data) {
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
            result: { data, token: token },
            message: "you have logged in successfully",
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
  try {
    const getUserInfo = await Users.findById({ _id: req.query.user_id });
    if (getUserInfo) {
      return res.json({
        success: true,
        result: getUserInfo,
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

//is_user
exports.is_user = async (req, res, next) => {
  try {
    const getUserData = await Users.findOne({ phone: req.body.phone });
    if (getUserData) {
      return res.json({
        success: true,
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
    let user_id = req.body.user_id;
    let editData = {};
    editData = req.body;
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
    let getUserInfo = await Users.findOne({ email: email });
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
          passwordResetToken: data.passwordResetToken,
          message: "OTP has been sent successfully",
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

exports.resetPasswordVerifyOtp = async (req, res, next) => {
  try {
    var { token, otp } = req.body;
    let user_id = req.body.user_id;
    const verifytoken = jwt.verify(token, process.env.JWT_KEY);
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
            message: "OTP verified successfully",
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
    let user_id = req.body.user_id;
    const verifytoken = jwt.verify(token, process.env.JWT_KEY);
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
    console.log(verifyToken)
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
  try {
    const search = req.query.search_word;
    var reg = new RegExp(search);
    const all_feeds = await Users.find({
      $or: [{ username: reg }, { first_name: reg }, { email: reg }],
    });
    console.log(all_feeds);
    if(all_feeds)
    {
      const user_id = req.query.user_id;
      const data_follower = await followSchema.distinct("followingId", {
        followerId: user_id,
      });
      const data_following = await followSchema.distinct("followerId", {
        followingId: user_id,
      });
      var array3 = data_follower.concat(data_following);
      var uniq_id = [...new Set(array3)];
  
      all_feeds.forEach((data) => {
        uniq_id.forEach((main_data) => {
          if (main_data == data.user_id) {
            data.follow = true;
          }
        });
      });
      return res.json({
        success: true,
        feeds: all_feeds,
      });
    }
    else
    {
      return res.json({
        success: false,
        message: "user not found "
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
  try {
    const file = req.files.photo;
    const user_id = req.body.user_id;

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
    const user_id = req.body.user_id;

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
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

exports.search_user_hashtag = async (req, res, next) => {

  try 
  {
    const search_user = req.query.search_user;
    const search_hashtag = req.query.search_hashtag;
    if(search_user)
    {
      let reg = new RegExp(search_user);
      const all_feeds = await Users.find({
        $or: [{ username: reg }, { first_name: reg }, { email: reg }],
      });
      console.log(all_feeds);
      if(all_feeds.length>0)
      {
        const user_id = req.query.user_id;
        const data_follower = await followSchema.distinct("followingId", {
          followerId: user_id,
        });
        const data_following = await followSchema.distinct("followerId", {
          followingId: user_id,
        });
        var array3 = data_follower.concat(data_following).map(String);
        var uniq_id = [...new Set(array3)];
        console.log(uniq_id);
        all_feeds.forEach((data) => {
          uniq_id.forEach((main_data) => {
            if (main_data == data.user_id) {
              data["follow"] = 1;
            }
          });
        });
        return res.json({
          success: true,
          feeds: all_feeds,
        });
      }
      else
      {
        return res.json({
          success: false,
          message: "user not found "
        });
      }
    }
    else if(search_hashtag)
    {
      let reg = new RegExp(search_hashtag);
      const getHashtags = await Hashtag.find({hashtag:reg});
      if(getHashtags.length>0)
      {
        let userFollowedHashtagList  = await Users.distinct("followedHashtag._id",{_id:req.query.user_id}).exec();
        userFollowedHashtagList = userFollowedHashtagList.map(String);
        var followedHashtagId = [...new Set(userFollowedHashtagList)];
        getHashtags.forEach((data) => {
          followedHashtagId.forEach((hashId) => {
            console.log(hashId == data._id);
            if(hashId == data._id)
            {
              data["follow"] = 1;
            }
          })
        });
        return res.json({
          success: true,
          result: getHashtags
        });
      }
      else
      {
        return res.json({
          success: false,
          message: "hashtag not found "
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
