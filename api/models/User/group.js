const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const group = new mongoose.Schema({
    groupTitle: {
        type: String,
        default: ""
    },
    groupImage: {
        type: String,
        default: ""
    },
    groupType: {
        type: String,
        default: ""
    },
    groupDescription: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    allowAnyoneToFindGroup: {
        type: Boolean,
        default: false
    },
    allowManualPhotoUploads: {
        type: Boolean,
        default: false
    },
    allowAdminAccept: {
        type: Boolean,
        default: false
    },
    adminApproveForPost: {
        type: Boolean,
        default: false
    },
    allowShare: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    members: {
        type: Number,
        default: 0
    },
    administrators: {
        type: Number,
        default: 0
    },
    pendingMembers: {
        type: Number,
        default: 0
    },
    blockedMembers: {
        type: Number,
        default: 0
    },
    pendingLoops: {
        type: Number,
        default: 0
    },
    mute: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users" 
        }
    }],
    groupMembersId: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users" 
        }
    }],
    groupAdminsId: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users" 
        }
    }],
    pendingMembersId: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users" 
        }
    }],
    blockedMembersId: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users" 
        }
    }],
    createdByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    createdByName: {
        type: String,
        default: ""
    },
    startDateTime: {
        type: String,
        default: ""
    },
    endDateTime: {
        type: String,
        default: ""
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    post_updatedOn: {
        type: Date
    },
    count: {
        type: Number,
        default: 0
    },
    groupPrivacyType: {
        type: String,
        default: ""
    },
    categoryTitle: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: ""
    }

});

module.exports = db_Main.model("groups", group)