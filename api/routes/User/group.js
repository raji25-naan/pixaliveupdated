const express = require("express");
const { createGroup, updateGroup, groupInfo, getMembers, getAdmins, muteGroup, getPendings, getGroups, searchGroup, joinGroup, makeMemberfromPendingList, makeAdmin, blockUnblockMembers, getBlockedMembers } = require("../../controllers/User/group");
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
            validateRequest,
            catch_error(makeMemberfromPendingList)
            )

//makeAdmin
router.post("/makeAdmin",
            checkSession,
            checkIsactive,
            checkRequestBodyParams('group_id'),
            checkRequestBodyParams('user_id'),
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

module.exports = router