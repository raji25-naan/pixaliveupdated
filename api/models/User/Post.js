const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  image: {
    type: String,
    default: "",
  },
  body: {
    type: String,
    default: "",
  },
  user_id: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    default: "",
  },
  created_at: {
    type: Date,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Posts", postSchema);
