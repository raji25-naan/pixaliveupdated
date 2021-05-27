const express = require("express");
const { oneOf } = require("express-validator/check");
const {
  signup,
  verifyOtp,
  resendotp,
  login,
  login_phone,
  changepassword,
  facebook_sign,
  user_info,
  is_user,
  updateProfile,
  forgotpassword,
  resetpassword,
  resetPasswordVerifyOtp,
  gcm_token_updation,
  search_place,
  upload_avatar,
  change_avatar,
  search,
  search_user,
} = require("../../controllers/User/User");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkParam,
  checkQuery,
} = require("../../middlewares/validator");

//signup
router.post(
  "/signup",
  checkRequestBodyParams("username"),
  checkRequestBodyParams("email"),
  checkRequestBodyParams("password"),
  checkRequestBodyParams("confirm_password"),
  checkRequestBodyParams("phone"),
  checkRequestBodyParams("first_name"),
  checkRequestBodyParams("last_name"),
  validateRequest,
  signup
);

router.post(
  "/verify_otp",
  checkRequestBodyParams("otp"),
  checkRequestBodyParams("user_id"),
  validateRequest,
  verifyOtp
);

router.post(
  "/resendotp",
  checkRequestBodyParams("user_id"),
  validateRequest,
  resendotp
);

router.post(
  "/login",
  checkRequestBodyParams("email"),
  checkRequestBodyParams("password"),
  validateRequest,
  login
);

router.post(
  "/login_phone",
  checkRequestBodyParams("phone"),
  checkRequestBodyParams("password"),
  validateRequest,
  login_phone
);

router.post(
  "/changepassword",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("user_id"),
  checkRequestBodyParams("oldpassword"),
  checkRequestBodyParams("newpassword"),
  checkRequestBodyParams("confirmpassword"),
  validateRequest,
  changepassword
);

router.post(
  "/facebook",
  checkRequestBodyParams("username"),
  checkRequestBodyParams("email"),
  checkRequestBodyParams("password"),
  checkRequestBodyParams("confirm_password"),
  checkRequestBodyParams("phone"),
  checkRequestBodyParams("first_name"),
  checkRequestBodyParams("last_name"),
  validateRequest,
  facebook_sign
);

router.get(
  "/userInfo",
  checkSession,
  checkIsactive,
  checkQuery("user_id"),
  validateRequest,
  user_info
);

router.post(
  "/is_user",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("phone"),
  validateRequest,
  is_user
);

router.post(
  "/updateProfile",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("user_id"),
  validateRequest,
  updateProfile
);

//reset_passwordstep1
router.post(
  "/forgotpassword",
  checkRequestBodyParams("email"),
  validateRequest,
  forgotpassword
);

//resetPasswordVerifyOtp
router.post(
  "/resetPasswordVerifyOtp",
  checkRequestBodyParams("user_id"),
  checkRequestBodyParams("otp"),
  checkRequestBodyParams("token"),
  validateRequest,
  resetPasswordVerifyOtp
);

//resetPassword
router.post(
  "/resetPassword",
  checkRequestBodyParams("user_id"),
  checkRequestBodyParams("token"),
  checkRequestBodyParams("password"),
  checkRequestBodyParams("confirmPassword"),
  validateRequest,
  resetpassword
);

//UpdateGcmtoken
router.post(
  "/update_gcmToken",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("user_id"),
  checkRequestBodyParams("token"),
  validateRequest,
  gcm_token_updation
);

// Search user
router.get(
  "/search_user",
  checkSession,
  checkIsactive,
  search_user
);
// Search place
router.get(
  "/search_place",
  checkSession,
  checkIsactive,
  search_place
);

// #1 - Upload avatar
router.post(
  "/upload_avatar",
  checkSession,
  checkIsactive,
  upload_avatar
);

// update avatar
router.post(
  "/change_avatar",
  checkSession,
  checkIsactive,
  change_avatar
);

// search
router.get(
  "/search",
  checkSession,
  checkIsactive,
  oneOf([checkQuery("search_user"), checkQuery("search_hashtag"), checkQuery("search_category")]),
  validateRequest,
  search
);

module.exports = router;
