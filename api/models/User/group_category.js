const mongoose = require("mongoose");
const { db_Main } = require("../../db/database");

const groupCategory = new mongoose.Schema({

    categoryTitle:{
        type: String
    },
    category:[]

  
});

module.exports = db_Main.model("groupCategories", groupCategory);
