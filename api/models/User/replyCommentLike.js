const mongoose = require("mongoose");
const { db_Main } = require("../../db/database");

const replycommentlike = new mongoose.Schema({

    replyComment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments"
    },    
    likedUser_id :{
        type : mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    created_at: {
        type : Date,
        default: Date.now()
    }
      
});

module.exports = db_Main.model("replycommentlikes", replycommentlike)