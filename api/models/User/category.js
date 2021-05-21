const mongoose = require("mongoose");
 
const category = new mongoose.Schema({
    category : {
        type : String,
        default : ''
    }
});

module.exports = mongoose.model("category",category)