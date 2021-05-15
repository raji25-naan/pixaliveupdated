const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  post_id: {
    type: String,
  },
  user_id: {
    type: String,
  },
  comment: {
    type: String,
  },
  created_at: {
    type: Date,
  },
});

module.exports = mongoose.model("Comments", commentSchema);
