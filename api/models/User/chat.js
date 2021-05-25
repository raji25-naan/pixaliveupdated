const mongoose = require("mongoose");

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

module.exports = mongoose.model("chat", chatSchema);
