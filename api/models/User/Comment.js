const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId
  },
  comment: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
  },
});

module.exports = mongoose.model("Comments", commentSchema);
