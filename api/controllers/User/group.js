const group = require("../../models/User/group");
const User = require("../../models/User/Users");
const Post = require("../../models/User/Post");

const sleep = require('sleep-promise');
const like = require("../../models/User/like");
const Comment = require("../../models/User/Comment");


//createGroup
exports.createGroup = async(req,res,next)=>{

    let user_id = req.user_id;
    let{groupTitle,
        groupImage,
        groupDescription,
        location,
        allowAnyoneToFindGroup,
        allowManualPhotoUploads,
        adminApproveForPost,
        allowAdminAccept,
        startDateTime,
        endDateTime,
        allowShare
       } = req.body;
    console.log(req.body);
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
        allowShare: allowShare,
        adminApproveForPost: adminApproveForPost,
        createdByUserId: user_id,
        createdByName: getUserInfo.name,
        startDateTime: startDateTime,
        endDateTime: endDateTime
    });
    const saveData = await groupData.save();
    console.log("saveData",saveData);
    if(saveData)
    {
        //addIdtoAdminandmemberList
        const addIdtoAdminandmemberList = await group.findOneAndUpdate(
            {_id: saveData._id},
            {
                $push: {
                    "groupAdminsId":{_id: user_id},
                    "groupMembersId":{_id: user_id}                   
                }
            },
            {new: true}
        );
        //incAdminandmemberCount
        const incAdminandmemberCount = await group.findOneAndUpdate(
            {_id: saveData._id},
            {
                $inc:{
                    members: 1,
                    administrators: 1
                }
            },
            {new: true}
        );
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
    getAdmin = getAdmin.toString();
    if(getAdmin.includes(user_id.toString()))
    {
        groupDetails = await group.findOne({_id: group_id}).exec();
    }
    else
    {
        groupDetails = await group.findOne({_id: group_id},
            {groupTitle: 1,groupImage: 1,groupDescription: 1,members: 1,mute: 1,groupMembersId: 1,groupAdminsId: 1,pendingMembersId: 1,blockedMembersId: 1,allowAdminAccept: 1,allowShare: 1}).exec();
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
    const membersDetail = await User.find({_id: members},{name: 1,username: 1, avatar: 1}).exec();
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
    const groupAdminsDetail = await User.find({_id: groupAdmins},{name: 1,username: 1, avatar: 1}).exec();
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
    const groupPendingsDetail = await User.find({_id: groupPendings},{name: 1,username: 1, avatar: 1}).exec();
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
    mutedUserIds = mutedUserIds.toString();
    if(mutedUserIds.includes(user_id.toString()))
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

//getDiscoverGroups
exports.getDiscoverGroups = async(req,res,next)=>{

    let user_id = req.user_id;  
    //blockedGroupIds
    let blockedGroupIds = await group.distinct("_id",{blockedMembersId:{_id:user_id}}).exec();
    //groupMembersIds
    let groupMembersIds = await group.distinct("_id",{groupMembersId:{_id:user_id}}).exec();
    let totalRejectedGroupIds = blockedGroupIds.concat(groupMembersIds);
    //getAllGroups
    const getAllGroups = await group.find({allowAnyoneToFindGroup: true,isDeleted: false,_id:{$nin: totalRejectedGroupIds}}).exec();
    if(getAllGroups.length)
    {
        var count1 = 0;
        getAllGroups.forEach(async(data)=>{

            //blockedUserIds
            let blockedUserIds = await group.distinct("blockedMembersId._id",{_id: data._id}).exec();
            const getCount = await Post.find({group_id: data._id,user_id:{$nin: blockedUserIds},
                                              isActive: true,
                                              isDeleted: false,
                                              verified: true}).exec();
            data.count = getCount.length;
            count1 = count1 + 1;
            if(getAllGroups.length == count1)
            {
                Response();
            }
        })

        //Response
        function Response()
        {
            return res.json({
                success: true,
                result: getAllGroups,
                message: "Successfully fetched"
            })
        }
        
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

//searchDiscoverGroups
exports.searchDiscoverGroups = async(req,res,next)=>{

    let search = req.query.search_group;
    let user_id = req.user_id;  
    //blockedGroupIds
    let blockedGroupIds = await group.distinct("_id",{blockedMembersId:{_id:user_id}}).exec();
    //groupMembersIds
    let groupMembersIds = await group.distinct("_id",{groupMembersId:{_id:user_id}}).exec();
    let totalRejectedGroupIds = blockedGroupIds.concat(groupMembersIds);

    const getAllGroups = await group.find({allowAnyoneToFindGroup: true,isDeleted: false,_id:{$nin: totalRejectedGroupIds}}).exec();

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

//getGroups
exports.getGroups = async(req,res,next)=>{

    let user_id = req.user_id;  
    //blockedGroupIds
    let blockedGroupIds = await group.distinct("_id",{blockedMembersId:{_id:user_id}}).exec();

    //getAllGroups
    let getAllGroups = await group.find({
        $or: [
            {groupMembersId:{_id: user_id},isDeleted: false,_id:{$nin: blockedGroupIds}},
            {groupAdminsId:{_id: user_id},isDeleted: false,_id:{$nin: blockedGroupIds}}
        ]
    }).sort({post_updatedOn: -1}).exec();
    if(getAllGroups.length)
    {
        var count1 = 0;
        getAllGroups.forEach(async(data)=>{

            //blockedUserIds
            let blockedUserIds = await group.distinct("blockedMembersId._id",{_id: data._id}).exec();
            //getCount
            const getCount = await Post.find({group_id: data._id,user_id:{$nin: blockedUserIds},
                                              isActive: true,
                                              isDeleted: false,
                                              verified: true}).exec();
            data.count = getCount.length;
            count1 = count1 + 1;
            if(getAllGroups.length == count1)
            {
                Response();
            }
        })

        //Response
        function Response()
        {
            return res.json({
                success: true,
                result: getAllGroups,
                message: "Successfully fetched"
            })
        }
        
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

    let user_id = req.user_id;  
    let search = req.query.search_group;
    //blockedGroupIds
    let blockedGroupIds = await group.distinct("_id",{blockedMembersId:{_id:user_id}}).exec();
    //getAllGroups
    let getAllGroups = await group.find({
        $or: [
            {groupMembersId:{_id: user_id},isDeleted: false,_id:{$nin: blockedGroupIds}},
            {groupAdminsId:{_id: user_id},isDeleted: false,_id:{$nin: blockedGroupIds}}
        ]
    }).exec();
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
        let pendingUserIds = await group.distinct("pendingMembersId._id",{_id: group_id}).exec();
        pendingUserIds = pendingUserIds.toString();

        if(pendingUserIds.includes(user_id.toString()))
        {
            return res.json({
                success: false,
                message: "Already you are in pending list"
            })  
        }
        else
        {
            //addToPendingList
            const addToPendingList = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $push: {
                        "pendingMembersId":{_id: user_id}
                    }
                },
                {new: true}
            );

            //incpendingMembersCount
            const incpendingMembersCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        pendingMembers: 1,
                    }
                },
                {new: true}
            );

            if(addToPendingList && incpendingMembersCount)
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

    }
    else
    {
        let groupMembersUserIds = await group.distinct("groupMembersId._id",{_id: group_id}).exec();
        groupMembersUserIds = groupMembersUserIds.toString();

        if(groupMembersUserIds.includes(user_id.toString()))
        {
            return res.json({
                success: false,
                message: "Already you are a member"
            })
        }
        else
        {
            //addToMemberList
            const addToMemberList = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $push: {
                        "groupMembersId":{_id: user_id}
                    }
                },
                {new: true}
            );
            //incMembersCount
            const incMembersCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        members: 1,
                    }
                },
                {new: true}
            );
            if(addToMemberList && incMembersCount)
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

}

//makeMemberfromPendingList
exports.makeMemberfromPendingList = async (req,res,next)=>{

    let { group_id,user_id,type} = req.body;

    let pendingUserIds = await group.distinct("pendingMembersId._id",{_id: group_id}).exec();
    pendingUserIds = pendingUserIds.toString();

    let groupMembersUserIds = await group.distinct("groupMembersId._id",{_id: group_id}).exec();
    groupMembersUserIds = groupMembersUserIds.toString();

    if(type == 1)
    {
        if(pendingUserIds.includes(user_id.toString()))
        {
            if(groupMembersUserIds.includes(user_id.toString()))
            {
                return res.json({
                    success: false,
                    message: "User is already member"
                })
            }
            else
            {
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

                //decpendingMembersCount
                const decpendingMembersCount = await group.findOneAndUpdate(
                    {_id: group_id},
                    {
                        $inc:{
                            pendingMembers: -1,
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

                //incMembersCount
                const incMembersCount = await group.findOneAndUpdate(
                    {_id: group_id},
                    {
                        $inc:{
                            members: 1,
                        }
                    },
                    {new: true}
                );

                if(removeIdfromPendingList && decpendingMembersCount && addIdtoMemberList && incMembersCount)
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
            
        }
        else
        {
            return res.json({
                success: false,
                message: "User is not in pending list"
            })
        }
        
    }
    else if(type == 0)
    {
        if(pendingUserIds.includes(user_id.toString()))
        {
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

            //decpendingMembersCount
            const decpendingMembersCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        pendingMembers: -1,
                    }
                },
                {new: true}
            );

            if(removeIdfromPendingList && decpendingMembersCount)
            {
                return res.json({
                    success: true,
                    message: "Successfully removed"
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
                message: "User is not in pending list"
            })
        }
    }
    
}

//makeAdmin
exports.makeAdmin = async (req,res,next)=>{

    let { group_id,user_id,type} = req.body;

    let adminUserIds = await group.distinct("groupAdminsId._id",{_id: group_id}).exec();
    adminUserIds = adminUserIds.toString();

    if(type == 1)
    {
        if(adminUserIds.includes(user_id.toString()))
        {
            return res.json({
                success: false,
                message: "Already user is an admin!"
            })
        }
        else
        {       
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
            //incAdminsCount
            const incAdminsCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        administrators: 1,
                    }
                },
                {new: true}
            );

            if(addIdtoAdminList && incAdminsCount)
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
    }
    else if(type == 0)
    {
        if(adminUserIds.includes(user_id.toString()))
        {
            //removeIdtoAdminList
            const removeIdtoAdminList = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $pull: {
                        "groupAdminsId":{_id: user_id}
                    }
                },
                {new: true}
            );
            //decAdminsCount
            const decAdminsCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        administrators: -1,
                    }
                },
                {new: true}
            );

            if(removeIdtoAdminList && decAdminsCount)
            {
                return res.json({
                    success: true,
                    message: "Successfully removed"
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
                message: "user not an admin"
            })
        }
    }
}

//blockUnblockMembers
exports.blockUnblockMembers = async(req,res,next)=>{

    let { group_id,user_id,type} = req.body;

    //blockedUserIds
    let blockedUserIds = await group.distinct("blockedMembersId._id",{_id: group_id}).exec();
    blockedUserIds = blockedUserIds.toString();
    if(type == 1)
    {
        if(blockedUserIds.includes(user_id.toString()))
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
            //incblockedMembersCount
            const incblockedMembersCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        blockedMembers: 1,
                    }
                },
                {new: true}
            );
            
            //removeFromMemberList
            const removeFromMemberList = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $pull: {
                        "groupMembersId":{_id: user_id}
                    }
                },
                {new: true}
            );
            
            //decMembersCount
            const decMembersCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        members: -1
                    }
                },
                {new: true}
            );

            if(addIdtoBlockList && incblockedMembersCount && removeFromMemberList && decMembersCount)
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

        if(blockedUserIds.includes(user_id.toString()))
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

            //decblockedMembersCount
            const decblockedMembersCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        blockedMembers: -1,
                    }
                },
                {new: true}
            );

            //addToMemberList
            const addToMemberList = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $push: {
                        "groupMembersId":{_id: user_id}
                    }
                },
                {new: true}
            );
            
            //incMembersCount
            const incMembersCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        members: 1
                    }
                },
                {new: true}
            );

            if(removeFromBlockList && decblockedMembersCount && addToMemberList && incMembersCount)
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

//exitGroupByUser
exports.exitGroupByUser = async(req,res,next)=>{
    
    let group_id = req.body.group_id;
    let user_id = req.user_id;

    //membersIds
    let membersIds = await group.distinct("groupMembersId._id",{_id: group_id}).exec();
    membersIds = membersIds.toString();
    //adminsIds
    let adminsIds = await group.distinct("groupAdminsId._id",{_id: group_id}).exec();
    adminsIds = adminsIds.toString();
    //muteIds
    let muteIds = await group.distinct("mute._id",{_id: group_id}).exec();
    muteIds = muteIds.toString();
    //blockedMembersUserIds
    let blockedMembersUserIds = await group.distinct("blockedMembersId._id",{_id: group_id}).exec();
    blockedMembersUserIds = blockedMembersUserIds.toString();

    //checkMember
    if(membersIds.includes(user_id.toString()))
    {
        const removeFromMemberList = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $pull: {
                    "groupMembersId":{_id: user_id}
                }
            },
            {new: true}
        );

        const decMembersCount = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $inc:{
                    members: -1
                }
            },
            {new: true}
        );
    }
    //checkAdmins
    if(adminsIds.includes(user_id.toString()))
    {
        const removeFromAdminList = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $pull: {
                    "groupAdminsId":{_id: user_id}
                }
            },
            {new: true}
        );

        const decAdminsCount = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $inc:{
                    administrators: -1
                }
            },
            {new: true}
        );
    }
    //checkMutes
    if(muteIds.includes(user_id.toString()))
    {
        const removeFromMuteList = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $pull: {
                    "mute":{_id: user_id}
                }
            },
            {new: true}
        );
    }
    //checkBlocked
    if(blockedMembersUserIds.includes(user_id.toString()))
    {
        const removeFromBlockList = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $pull: {
                    "blockedMembersId":{_id: user_id}
                }
            },
            {new: true}
        );

        const decblockedMembersCount = await group.findOneAndUpdate(
            {_id: group_id},
            {
                $inc:{
                    blockedMembers: -1
                }
            },
            {new: true}
        );
    }

    //updatedPost
    const updatedPost = await Post.updateMany(
        {group_id: group_id,user_id: user_id},
        {
            $set:{isDeleted: true}
        },
        {new: true}
    );
    
    //likedPostIds
    let likedPostIds = await like.distinct("post_id",{group_id: group_id,user_id: user_id}).exec();
    likedPostIds.forEach(async(element) => {
        await Post.findOneAndUpdate(
            {_id: element},
            {
                $inc: {likeCount: -1}
            },
            {new: true}
        );
    });
    //commentedPostIds
    let commentedPostIds = await Comment.distinct("post_id",{group_id: group_id,user_id: user_id}).exec();
    commentedPostIds.forEach(async(element) => {
        await Post.findOneAndUpdate(
            {_id: element},
            {
                $inc: {commentCount: -1}
            },
            {new: true}
        );
    });

    sleep(2000).then(async function () {
        await like.deleteMany({group_id: group_id,user_id: user_id});
        await Comment.deleteMany({group_id: group_id,user_id: user_id});

        return res.json({
            success: true,
            message: "Successfully deleted"
        })
    })

}

//deleteGroup
exports.deleteGroup = async(req,res,next)=>{

    let group_id = req.body.group_id;
    //updatedGroup
    const updatedGroup = await group.findOneAndUpdate(
        {_id: group_id},
        {
            $set:{isDeleted: true}
        },
        {new: true}
    );
    //updatedPost
    const updatedPost = await Post.updateMany(
        {group_id: group_id},
        {
            $set:{isDeleted: true}
        },
        {new: true}
    );

    if(updatedGroup && updatedPost)
    {
        return res.json({
            success: true,
            message: "Successfully deleted"
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

//removeMember
exports.removeMember = async(req,res,next)=>{

    let {group_id,user_id} = req.body;

    const removeFromMemberList = await group.findOneAndUpdate(
        {_id: group_id},
        {
            $pull: {
                "groupMembersId":{_id: user_id}
            }
        },
        {new: true}
    );

    const decMembersCount = await group.findOneAndUpdate(
        {_id: group_id},
        {
            $inc:{
                members: -1
            }
        },
        {new: true}
    );

    if(removeFromMemberList && decMembersCount)
    {
        return res.json({
            success: true,
            message: "Successfully removed user"
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
