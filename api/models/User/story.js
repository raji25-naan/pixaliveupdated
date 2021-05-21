const mongoose = require("mongoose");
const moment = require("moment");

const story = new mongoose.Schema({

  url: {
    type: String,
    default : ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "users"
  }, 
  storyDisappearTime:{
    type:Date,
    default: moment().add(1, 'd').toDate()
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
