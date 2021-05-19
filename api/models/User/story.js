const mongoose = require("mongoose");

const story = new mongoose.Schema({

  url: {
    type: String,
    default : ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "users"
  }, 
  storyDisappearTime : {
    type : String
  },
  viewed_userId : {
    type : [String]
  },
  viewedCount : {
    type : Number,
    default : 0
  },
  created_at: {
    type: Date
  },
});

module.exports = mongoose.model("story", story);
