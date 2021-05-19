const mongoose = require("mongoose");

const viewPost = new mongoose.Schema({

  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "Posts"
  },
  viewed_userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "users"
  }
});

module.exports = mongoose.model("viewPosts", viewPost);
