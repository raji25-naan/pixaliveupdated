const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const user_schema = new mongoose.Schema({
  username: {
    type: String,
    default: "",
  },
  first_name: {
    type: String,
    default: "",
  },
  last_name: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },
  country_code: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  otp: {
    type: String,
    default: "",
  },
  passwordResetToken: {
    type: String,
    default: "",
  },
  otp_verified: {
    type: Boolean,
    default: false,
  },
  otpExpirationTime: {
    type: String,
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  gcm_token: {
    type: String,
  },
  avatar: {
    type: String,
  },
  created_At: {
    type: Date,
  },
  updated_At: {
    type: Date,
    default: "",
  },
  facebook_signin: {
    type: Boolean,
    default: false,
  },
  follow: {
    type: Number,
    default: 0,
  },
  followedHashtag: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      hashtag: { type: String },
    },
  ],
  lat: {
    type: String,
    default: "",
  },
  lng: {
    type: String,
    default: "",
  },
  user_bio: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: false,
  }
});
const user = db_Main.model("users", user_schema);
module.exports = user;
