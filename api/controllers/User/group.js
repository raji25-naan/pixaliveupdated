const group = require("../../models/User/group");
const User = require("../../models/User/Users");

//createGroup
exports.createGroup = async(req,res,next)=>{

    let user_id = req.user_id;
    let{groupTitle,
        groupImage,
        groupDescription,
        location,
        allowAnyoneToFindGroup,
        allowManualPhotoUploads,
        allowAdminAccept,
        startDateTime,
        endDateTime} = req.body;

    //findGroupname
    const findGroupname = await group.findOne({groupTitle: groupTitle}).exec();
    if(findGroupname)
    {
        return res.json({
            success: false,
            message: "Group name already exists!"
        })
    }
    //getUserInfo
    let getUserInfo = await User.findOne({_id: user_id}).exec();
    const groupData = new group({
        groupTitle: groupTitle,
        groupImage: groupImage,
        groupDescription: groupDescription,
        location: location,
        allowAnyoneToFindGroup: allowAnyoneToFindGroup,
        allowManualPhotoUploads: allowManualPhotoUploads,
        allowAdminAccept: allowAdminAccept,
        createdByUserId: user_id,
        createdByName: getUserInfo.name,
        startDateTime: startDateTime,
        endDateTime: endDateTime
    });
    const saveData = await groupData.save();
    if(saveData)
    {
        return res.json({
            success: true,
            message: "Successfully created group.."
        })
    }
    else
    {
        return res.json({
            success: false,
            message: "Error Occured"
        })
    }

}

//updateGroup
exports.updateGroup = async(req,res,next)=>{

    let{group_id,
        groupTitle,
        groupImage,
        groupDescription,
        location,
        allowAnyoneToFindGroup,
        allowManualPhotoUploads,
        adminApproveForPost,
        allowAdminAccept,
        allowShare,
        startDateTime,
        endDateTime} = req.body;

    const editGroup = await group.findOneAndUpdate(
        {_id: group_id},
        {
            $set:{
                groupTitle: groupTitle,
                groupImage: groupImage,
                groupDescription: groupDescription,
                location: location,
                allowAnyoneToFindGroup: allowAnyoneToFindGroup,
                allowManualPhotoUploads: allowManualPhotoUploads,
                adminApproveForPost: adminApproveForPost,
                allowAdminAccept: allowAdminAccept,
                allowShare: allowShare,
                startDateTime: startDateTime,
                endDateTime: endDateTime
            }
        },
        {new: true}
    );

    if(editGroup)
    {
        return res.json({
            success: true,
            message: "Successfully updated group.."
        })
    }
    else
    {
        return res.json({
            success: false,
            message: "Error Occured"
        })
    }

}

//groupInfo
exports.groupInfo = async(req,res,next)=>{

    let group_id = req.query.group_id;
    let user_id = req.user_id;
    let groupDetails
    //getAdmin
    let getAdmin = await group.distinct("groupAdminsId._id",{_id: group_id}).exec();

    if(getAdmin.includes(user_id))
    {
        groupDetails = await group.findOne({_id: group_id}).exec();
    }
    else
    {
        groupDetails = await group.findOne({_id: group_id},{groupTitle: 1,groupImage: 1,groupDescription: 1,members: 1}).exec();
    }

    //groupDetails
    if(groupDetails)
    {
        return res.json({
            success: true,
            result: groupDetails,
            message: "Successfully fetched"
        })
    }
    else
    {
        return res.json({
            success: false,
            message: "Error Occured"
        })
    }

}

//getMembers
exports.getMembers = async(req,res,next)=>{

    let group_id = req.query.group_id;
    //members
    let members = await group.distinct("groupMembersId._id",{_id: group_id}).exec();
    //membersDetail
    const membersDetail = await User.find({_id: members},{name: 1, avatar: 1}).exec();
    if(membersDetail.length)
    {
        return res.json({
            success: true,
            result: membersDetail,
            message: "Successfully fetched"
        })
    }
    else
    {
        return res.json({
            success: false,
            message: "Error Occured"
        })
    }
}

//getAdmins
exports.getAdmins = async(req,res,next)=>{

    let group_id = req.query.group_id;
    //groupAdmins
    let groupAdmins = await group.distinct("groupAdminsId._id",{_id: group_id}).exec();
    //groupAdminsDetail
    const groupAdminsDetail = await User.find({_id: groupAdmins},{name: 1, avatar: 1}).exec();
    if(groupAdminsDetail.length)
    {
        return res.json({
            success: true,
            result: groupAdminsDetail,
            message: "Successfully fetched"
        })
    }
    else
    {
        return res.json({
            success: false,
            message: "Error Occured"
        })
    }
}

//getPendings
exports.getPendings = async(req,res,next)=>{

    let group_id = req.query.group_id;
    //groupPendings
    let groupPendings = await group.distinct("pendingMembersId._id",{_id: group_id}).exec();
    //groupAdminsDetail
    const groupPendingsDetail = await User.find({_id: groupPendings},{name: 1, avatar: 1}).exec();
    if(groupPendingsDetail.length)
    {
        return res.json({
            success: true,
            result: groupPendingsDetail,
            message: "Successfully fetched"
        })
    }
    else
    {
        return res.json({
            success: false,
            message: "Error Occured"
        })
    }

}

//muteGroup
exports.muteGroup = async(req,res,next)=>{

    let user_id = req.user_id;
    let group_id = req.body.group_id;
    //mutedUserIds
    let mutedUserIds = await group.distinct("mute._id",{_id: group_id}).exec();

    if(mutedUserIds.includes(user_id))
    {
        const unmute = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $pull: {
                    "mute":{_id: user_id}
                }
            },
            {new: true}
        );

        if(unmute)
        {
            return res.json({
                success: true,
                message: "Successfully unmuted"
            })
        }
        else
        {
            return res.json({
                success: false,
                message: "Error Occured"
            })
        }
    }
    else
    {
        const mute = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $push: {
                    "mute":{_id: user_id}
                }
            },
            {new: true}
        );

        if(mute)
        {
            return res.json({
                success: true,
                message: "Successfully muted"
            })
        }
        else
        {
            return res.json({
                success: false,
                message: "Error Occured"
            })
        }
    }

}

//getGroups
exports.getGroups = async(req,res,next)=>{

    const getAllGroups = await group.find({allowAnyoneToFindGroup: true}).exec();
    if(getAllGroups.length)
    {
        return res.json({
            success: true,
            result: getAllGroups,
            message: "Successfully fetched"
        })
    }
    else
    {
        return res.json({
            success: true,
            result: [],
            message: "No data"
        })
    }

}

//searchGroup
exports.searchGroup = async(req,res,next)=>{

    let search = req.query.search_group;

    const getAllGroups = await group.find({allowAnyoneToFindGroup: true}).exec();

    const all_groups = getAllGroups.filter(data => new RegExp(search, "ig").test(data.groupTitle)).sort((a, b) => {
        let re = new RegExp("^" + search, "i")
        return re.test(a.groupTitle) ? re.test(b.groupTitle) ? a.groupTitle.localeCompare(b.groupTitle) : -1 : 1
      });

    if(all_groups.length)
    {
        return res.json({
            success: true,
            result: all_groups,
            message: "Successfully fetched"
        })
    }
    else
    {
        return res.json({
            success: true,
            result: [],
            message: "No data"
        })
    }

}

//joinGroup
exports.joinGroup = async (req,res,next)=>{

    let user_id = req.user_id;
    let group_id = req.body.group_id;

    const groupInfo = await group.findOne({_id: group_id}).exec();
    if(groupInfo.allowAdminAccept == true)
    {
        const addToPendingList = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $push: {
                    "pendingMembersId":{_id: user_id}
                }
            },
            {new: true}
        );
        if(addToPendingList)
        {
            return res.json({
                success: true,
                message: "Successfully sent request"
            })
        }
        else
        {
            return res.json({
                success: false,
                message: "Error occured"
            })
        }
    }
    else
    {
        const addToMemberList = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $push: {
                    "groupMembersId":{_id: user_id}
                }
            },
            {new: true}
        );
        if(addToMemberList)
        {
            return res.json({
                success: true,
                message: "Successfully joined"
            })
        }
        else
        {
            return res.json({
                success: false,
                message: "Error occured"
            })
        }
    }

}

//makeMemberfromPendingList
exports.makeMemberfromPendingList = async (req,res,next)=>{

    let { group_id,user_id} = req.body;

    //removeIdfromPendingList
    const removeIdfromPendingList = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $pull: {
                    "pendingMembersId":{_id: user_id}
                }
            },
            {new: true}
    );

    //addIdtoMemberList
    const addIdtoMemberList = await group.findOneAndUpdate(
        {_id: group_id},
        {
            $push: {
                "groupMembersId":{_id: user_id}
            }
        },
        {new: true}
    );

    if(removeIdfromPendingList && addIdtoMemberList)
    {
        return res.json({
            success: true,
            message: "Successfully added"
        })
    }
    else
    {
        return res.json({
            success: false,
            message: "Error occured"
        })
    }

}

//makeAdmin
exports.makeAdmin = async (req,res,next)=>{

    let { group_id,user_id} = req.body;

    //addIdtoAdminList
    const addIdtoAdminList = await group.findOneAndUpdate(
        {_id: group_id},
        {
            $push: {
                "groupAdminsId":{_id: user_id}
            }
        },
        {new: true}
    );

    if(addIdtoAdminList)
    {
        return res.json({
            success: true,
            message: "Successfully added"
        })
    }
    else
    {
        return res.json({
            success: false,
            message: "Error occured"
        })
    }
}

//blockUnblockMembers
exports.blockUnblockMembers = async(req,res,next)=>{

    let { group_id,user_id,type} = req.body;

    //blockedUserIds
    let blockedUserIds = await group.distinct("blockedMembersId._id",{_id: group_id}).exec();

    if(type == 1)
    {
        if(blockedUserIds.includes(user_id))
        {
            return res.json({
                success: false,
                message: "Already blocked"
            })
        }
        else
        {
            //addIdtoBlockList
            const addIdtoBlockList = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $push: {
                        "blockedMembersId":{_id: user_id}
                    }
                },
                {new: true}
            ); 
            if(addIdtoBlockList)
            {
                return res.json({
                    success: true,
                    message: "Successfully blocked"
                })
            }
            else
            {
                return res.json({
                    success: false,
                    message: "Error occured"
                })
            }
        }
    }
    else if(type == 0)
    {

        if(blockedUserIds.includes(user_id))
        {
            //removeFromBlockList
            const removeFromBlockList = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $pull: {
                        "blockedMembersId":{_id: user_id}
                    }
                },
                {new: true}
            );

            if(removeFromBlockList)
            {
                return res.json({
                    success: true,
                    message: "Successfully unblocked"
                })
            }
            else
            {
                return res.json({
                    success: false,
                    message: "Error occured"
                })
            }
        }
        else
        {
            return res.json({
                success: false,
                message: "User was not already blocked"
            })
        }
    }

}

//getBlockedMembers
exports.getBlockedMembers = async(req,res,next)=>{

    let group_id = req.query.group_id;

    //blockedUserIds
    let blockedUserIds = await group.distinct("blockedMembersId._id",{_id: group_id}).exec();

    //userInfo
    const userInfo = await User.find({_id: blockedUserIds},{name: 1,username: 1,avatar: 1}).exec();
    if(userInfo.length)
    {
        return res.json({
            success: true,
            result: userInfo,
            message: "Successfully fetched blocked members"
        })
    }
    else
    {
        return res.json({
            success: true,
            result: [],
            message: "No blocked members"
        })
    }
}