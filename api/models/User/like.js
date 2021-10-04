const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const likes = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts"
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "groups"
  },
  isLike: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date
  },
});

module.exports = db_Main.model("likes", likes);
