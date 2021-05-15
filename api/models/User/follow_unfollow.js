const mongoose = require("mongoose");

const follow_unfollow = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'users'
  },
  followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'users'
  },
  status: {
    type: Number, 
    default:0 
  },
  created_at: {
    type: Date
  },
});

module.exports = mongoose.model("follow_unfollows", follow_unfollow);
