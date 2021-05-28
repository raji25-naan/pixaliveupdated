const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  url : {
    type : String
  },
  text_content: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  post_type: {
    type: Number,
  },
  body: {
    type: String,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "users"
  },
  place: {
    type: String,
  },
  created_at: {
    type: Date,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0
  },
  hashtag: {
    type: Array,
  },
  lat: {
    type:String,
    default:""
  },
  lng: {
    type:String,
    default:""
  },
  category: {
    type:String
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isLiked: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default : ""
  }
});

module.exports = mongoose.model("Posts", postSchema);
