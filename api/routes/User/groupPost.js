const express = require("express");
const { createPostOnGroup, getGroupPost } = require("../../controllers/User/groupPost");
const router = express.Router();
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { validateRequest, checkRequestBodyParams, checkQuery } = require("../../middlewares/validator");
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

//createPostOnGroup
router.post("/createPostOnGroup",
            checkSession,
            checkIsactive,
            checkRequestBodyParams('group_id'),
            checkRequestBodyParams('url'),
            checkRequestBodyParams('type'),
            validateRequest,
            catch_error(createPostOnGroup)
            )

//getGroupPost
 router.get("/getGroupPost",
            checkSession,
            checkIsactive,
            checkQuery('group_id'),
            validateRequest,
            catch_error(getGroupPost)
            )

            
module.exports = router;