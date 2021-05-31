const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")
const commentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  comment: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
  },
});

module.exports = db_Main.model("Comments", commentSchema);
