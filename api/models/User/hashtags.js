const mongoose = require("mongoose");

const hashtag = new mongoose.Schema({

  hashtag: {
    type: String
  },
  followerCount : {
    type: Number,
    default : 0
  },
  created_at: {
    type: Date
  },
  follow : {
    type : Number,
    default : 0
  }
});

module.exports = mongoose.model("hashtags", hashtag);
