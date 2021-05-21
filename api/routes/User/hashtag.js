const express = require("express");
const { followUnfollowHashtag } = require("../../controllers/User/hashtag");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams, validateRequest } = require("../../middlewares/validator");
const router = express.Router();
const Hashtag = require("../../models/User/hashtags");
const user = require("../../models/User/Users");

router.post("/follow_unfollow_hashtag",
            // checkSession,
            checkRequestBodyParams('type').isIn(['1', '0']),
            checkRequestBodyParams("userId"),
            checkRequestBodyParams("hashId"),
            checkRequestBodyParams("hashtag"),
            validateRequest,
            followUnfollowHashtag
)

module.exports = router;