const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")
const chatSchema = new mongoose.Schema({
  sender_id: {
    type: String,
  },
  receiver_id: {
    type: String,
  },
  message: {
    type: String,
  },
  created_at: {
    type: Date,
  },
});

module.exports = db_Main.model("chat", chatSchema);
