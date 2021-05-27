const express = require("express");
const { createFollow, mutualFriendList, get_following, get_followers, suggestionFriendList } = require("../../controllers/User/follow_unfollow");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams, validateRequest, checkParam, checkQuery } = require("../../middlewares/validator");
const router = express.Router();

router.post('/follow',
            checkSession,
            checkIsactive,
            checkRequestBodyParams('type').isIn(['1', '0']),
            checkRequestBodyParams('following_id'),
            validateRequest,
            createFollow
            )

router.get('/mutuals',
            checkSession,
            checkIsactive,
            checkQuery('id'),
            validateRequest,
            mutualFriendList
            )

router.get('/get_following',
            checkSession,
            checkQuery('id'),
            checkQuery('uid'),
            validateRequest,
            get_following
            )

router.get('/get_followers',
            // checkSession,
            checkQuery('id'),
            checkQuery('uid'),
            validateRequest,
            get_followers
            )

router.get('/suggestionFriendList',
            checkSession,
            checkQuery('userId'),
            checkQuery('lat'),
            checkQuery('lng'),
            validateRequest,
            suggestionFriendList
)

module.exports = router