const mongoose = require("mongoose");
 
const reports = new mongoose.Schema({
    post_id: {
        type: String,
        default: ""
    },
    reportedByid: {
        type: String,
        default: ""
    },
    report: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("reports",reports)