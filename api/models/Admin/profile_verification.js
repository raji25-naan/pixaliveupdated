const mongoose = require("mongoose");
const { db_Main } = require("../../db/database");

const profileverification = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    category: {
        type: String,
        default: ''
    },
    proofVideo: {
        type: String,
        default: ''
    },
    aadharCardImage: {
        type: String,
        default: ''
    },
    profileVerified: {
        type: Boolean,
        default: false
    },
    created_At : {
        type: Date,
        default: Date.now()
    }

});

module.exports = db_Main.model("profileverifications", profileverification)