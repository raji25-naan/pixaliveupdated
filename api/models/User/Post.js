const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  image_url: {
    type: String,
  },
  audio_url: {
    type: String,
  },
  video_url: {
    type: String,
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
  follow: {
    type: Number,
    default: 0,
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
  }
});

module.exports = mongoose.model("Posts", postSchema);
