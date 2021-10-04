const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const draft = new mongoose.Schema({
  url: {
    type: String,
    default: ""
  },
  text_content: {
    type: String
  },
  thumbnail: {
    type: String
  },
  post_type: {
    type: Number
  },
  body: {
    type: String
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  created_at: {
    type: Date
  },
  category: [],
  privacyType: {
    type: String,
    default: ""
  },
  tagged_userId: [],
  reloopPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts"
  },
  comment_option: {
    type: Boolean,
    default: true
  },
  download_option: {
    type: Boolean,
    default: true
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "groups"
  },
  groupPost: {
    type: Boolean,
    default: false
  }

});

module.exports = db_Main.model("drafts", draft);
