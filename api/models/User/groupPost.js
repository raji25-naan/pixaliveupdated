const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const groupPost = new mongoose.Schema({

    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groups"
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },  
    post_type: {
        type: Number,
        default: 0
    },
    url: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = db_Main.model("groupPosts", groupPost)