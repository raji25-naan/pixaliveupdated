const mongoose = require("mongoose");
const { db_Main } = require("../../db/database");

const groupCategory = new mongoose.Schema({

    category: {
        type: String,
    },
    image: {
        type: String
    }

  
});

module.exports = db_Main.model("groupCategories", groupCategory);
