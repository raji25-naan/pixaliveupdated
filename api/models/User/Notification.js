const mongoose = require("mongoose");

const Notification = new mongoose.Schema({
  
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  title: {
    type: String
  },
  message: {
    type: String
  },
  read: {
    type: Boolean,
    default : false
  }
});

module.exports = mongoose.model("Notification", Notification);
