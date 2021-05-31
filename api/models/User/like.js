const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const likes = new mongoose.Schema({
  post_id: {
    type: String,
  },
  user_id: {
    type: String,
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
