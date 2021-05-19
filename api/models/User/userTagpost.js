const mongoose = require("mongoose");

const taggedPost = new mongoose.Schema({

  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "Posts"
  },
  tagged_userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "users"
  },
  taggedByuserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "users"
  },
  created_at: {
    type: Date
  }
});

module.exports = mongoose.model("taggedPost", taggedPost);
