const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")
const commentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts"
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  Reply: [
    {
      user_id :{
       type : mongoose.Schema.Types.ObjectId,
       ref: "users"
      },
      replyComment :{
        type: String
      },
      created_at: {
        type: Date
      },
      ReplyLikeCount: {
        type : Number,
        default : 0
      },
      isLikedReply :{
        type : Number,
        default : 0
      }
    }
  ],
  LikedUser:[
    {
      _id :{
       type : mongoose.Schema.Types.ObjectId,
       ref: "users"
      }
    }
  ],
  likeCount :{
    type : Number,
    default : 0
  },
  isLiked :{
    type : Number,
    default : 0
  },
  comment: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date
  }
});

module.exports = db_Main.model("Comments", commentSchema);
