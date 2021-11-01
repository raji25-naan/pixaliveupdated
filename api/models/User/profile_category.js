const mongoose = require("mongoose");
const { db_Main } = require("../../db/database");

const profileCategory = new mongoose.Schema({

    category:{
        type: String
    }

});

module.exports = db_Main.model("profileCategories", profileCategory);
