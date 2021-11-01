const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const donate = new mongoose.Schema({
    
  donatedUser_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  donatedByUser_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts"
  },
  coins: {
    type: Number,
    default: 0
  },
  trees: {
    type: Number,
    default: 0
  },
  seedBalls: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default : Date.now()
  }
});

module.exports = db_Main.model("donates", donate);
