const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const postSchema = new mongoose.Schema({
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
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  hashtag: {
    type: Array
  },
  place: {
    type: String,
    default: ""
  },
  category: [],
  isActive: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isLiked: {
    type: Number,
    default: 0
  },
  isSaved: {
    type: Number,
    default: 0
  },
  privacyType: {
    type: String,
    default: ""
  },
  tagged_userId: [],
  reloopPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts"
  },
  reloopCount: {
    type: Number,
    default: 0
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
  showInFeeds: {
    type: Boolean,
    default: true
  },
  groupPost: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: true
  },
  encryptId: {
    type: String,
    default: ""
  },
  media_datatype: {
    type: String,
    default: ""
  },
  viewCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  }

});

module.exports = db_Main.model("Posts", postSchema);
