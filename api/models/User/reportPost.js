const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

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

module.exports = db_Main.model("reports", reports)