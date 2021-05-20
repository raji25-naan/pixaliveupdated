const mongoose = require("mongoose");

const viewPost = new mongoose.Schema({

  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "Posts"
  },
  post_userID :{
    type: mongoose.Schema.Types.ObjectId,
    ref : "postusers"
  },
  viewed_userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "users"
  },
  created_At : {
    type : Date
  }
});

module.exports = mongoose.model("viewPosts", viewPost);
