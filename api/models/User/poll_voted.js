const mongoose = require("mongoose");
const { db_Main } = require("../../db/database");

const pollvoted = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts"
      },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      },
    option_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts"
      },
    created_at: {
        type: Date,
        default: Date.now()
      }
});

module.exports = db_Main.model("pollvoteds",pollvoted);