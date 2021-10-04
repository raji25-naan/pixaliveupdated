const express = require("express");
const { getGroupPost, getGroupPendingPost, Accept_RejectGroupPost } = require("../../controllers/User/groupPost");
const router = express.Router();
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { validateRequest, checkRequestBodyParams, checkQuery } = require("../../middlewares/validator");
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


//getGroupPost
 router.get("/getGroupPost",
            checkSession,
            checkIsactive,
            checkQuery('group_id'),
            validateRequest,
            catch_error(getGroupPost)
            )

//getGroupPendingPost
router.get("/getGroupPendingPost",
            checkSession,
            checkIsactive,
            checkQuery('group_id'),
            validateRequest,
            catch_error(getGroupPendingPost)
            )   
            
//Accept_RejectGroupPost
router.post("/Accept_RejectGroupPost",
            checkSession,
            checkIsactive,
            checkRequestBodyParams('post_id'),
            checkRequestBodyParams('group_id'),
            checkRequestBodyParams('type'),
            validateRequest,
            catch_error(Accept_RejectGroupPost)
            )

            
module.exports = router;