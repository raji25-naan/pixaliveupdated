const mongoose = require("mongoose");

const register = new mongoose.Schema({

    username : {
        type : String,
        default : ''
    },
    email : {
        type : String,
        default : ''
    },
    password : {
        type : String,
        default : ''
    },
    country_code : {
        type : String,
        default : ''
    },
    phone : {
        type : String,
        default : ''
    },
    created_At : {
        type : Date
    },
    updated_At : {
        type : Date,
        default : ''
    }
});

module.exports = mongoose.model("registers",register)