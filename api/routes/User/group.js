const express = require("express");
const { createGroup, updateGroup, groupInfo, getMembers, getAdmins, muteGroup, getPendings, getGroups, searchGroup, joinGroup, makeMemberfromPendingList, makeAdmin, blockUnblockMembers, getBlockedMembers, getDiscoverGroups, searchDiscoverGroups, exitGroupByUser, deleteGroup, removeMember, insertGroupCategory, getGroupCategory, getGroupsByCategory } = require("../../controllers/User/group");
const router = express.Router();
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { validateRequest, checkRequestBodyParams, checkQuery } = require("../../middlewares/validator");
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

//createGroup
router.post("/createGroup",
            checkSession,
            checkIsactive,
            catch_error(createGroup)
            )

//updateGroup
router.post("/updateGroup",
            checkSession,
            checkIsactive,
            catch_error(updateGroup)
            )

//groupInfo
router.get("/groupInfo",
            checkSession,
            checkIsactive,
            catch_error(groupInfo)
            )

//getMembers
router.get("/getMembers",
            checkSession,
            checkIsactive,
            catch_error(getMembers)
            )

//getAdmins
router.get("/getAdmins",
            checkSession,
            checkIsactive,
            catch_error(getAdmins)
            )

//getPendings
router.get("/getPendings",
            checkSession,
            checkIsactive,
            catch_error(getPendings)
            )

//muteGroup
router.post("/muteGroup",
            checkSession,
            checkIsactive,
            catch_error(muteGroup)
            ) 
            
//getGroups
router.get("/getGroups",
            checkSession,
            checkIsactive,
            catch_error(getGroups)
            )

//searchGroup
router.get("/searchGroup",
            checkSession,
            checkIsactive,
            catch_error(searchGroup)
            )

//getDiscoverGroups
router.get("/getDiscoverGroups",
            checkSession,
            checkIsactive,
            catch_error(getDiscoverGroups)
            )

//searchDiscoverGroups
router.get("/searchDiscoverGroups",
            checkSession,
            checkIsactive,
            catch_error(searchDiscoverGroups)
            )

//joinGroup
router.post("/joinGroup",
            checkSession,
            checkIsactive,
            checkRequestBodyParams('group_id'),
            validateRequest,
            catch_error(joinGroup)
            )

//makeMemberfromPendingList
router.post("/makeMemberfromPendingList",
            checkSession,
            checkIsactive,
            checkRequestBodyParams('group_id'),
            checkRequestBodyParams('user_id'),
            checkRequestBodyParams('type'),
            validateRequest,
            catch_error(makeMemberfromPendingList)
            )

//makeAdminandRemoveAdmin
router.post("/makeAdmin",
            checkSession,
            checkIsactive,
            checkRequestBodyParams('group_id'),
            checkRequestBodyParams('user_id'),
            checkRequestBodyParams('type'),
            validateRequest,
            catch_error(makeAdmin)
            )

//blockUnblockMembers
router.post("/blockUnblockMembers",
            checkSession,
            checkIsactive,
            checkRequestBodyParams('group_id'),
            checkRequestBodyParams('user_id'),
            checkRequestBodyParams('type'),
            validateRequest,
            catch_error(blockUnblockMembers)
            )

//getBlockedMembers
router.get("/getBlockedMembers",
            checkSession,
            checkIsactive,
            checkQuery('group_id'),
            validateRequest,
            catch_error(getBlockedMembers)
            )

//exitGroupByUser
router.post("/exitGroupByUser",
            checkSession,
            checkIsactive,
            checkRequestBodyParams('group_id'),
            validateRequest,
            catch_error(exitGroupByUser)
        )

//deleteGroup
router.post("/deleteGroup",
            checkSession,
            checkIsactive,
            checkRequestBodyParams('group_id'),
            validateRequest,
            catch_error(deleteGroup)
        )

//removeMember
router.post("/removeMember",
            checkSession,
            checkIsactive,
            checkRequestBodyParams('group_id'),
            checkRequestBodyParams('user_id'),
            validateRequest,
            catch_error(removeMember)
        )

//insertGroupCategory
router.post("/insertGroupCategory",
            catch_error(insertGroupCategory)
            )

//getGroupCategory
router.get("/getGroupCategory",
            checkSession,
            checkIsactive,
            catch_error(getGroupCategory)
            )

//getGroupsByCategory
router.get("/getGroupsByCategory",
            checkSession,
            checkIsactive,
            checkQuery('categoryTitle'),
            catch_error(getGroupsByCategory)
            )
        
            
module.exports = router