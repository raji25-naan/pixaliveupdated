const mongoose = require("mongoose");

const likes = new mongoose.Schema({
  post_id: {
    type: String,
  },
  user_id: {
    type: String,
  },
  isLike: {
    type: Number, 
    default:0 
  },
  created_at: {
    type: Date
  },
});

module.exports = mongoose.model("likes", likes);
