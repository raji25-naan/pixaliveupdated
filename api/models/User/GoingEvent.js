const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const goingevent = new mongoose.Schema({
    
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts"
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  created_at: {
    type: Date
  }
});

module.exports = db_Main.model("goingevents", goingevent);
