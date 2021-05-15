const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  post_id: {
    type: String,
  },
  sender_id: {
    type: String,
  },
  receiver_id: {
    type: String,
  },
  type: {
    type: String,
  },
  seen: {
    type: Boolean,
  },
  created_at: {
    type: Date,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
