const express = require("express");
const { add_like, liked_post } = require("../../controllers/User/like");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams,validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.post('/likePost',
            checkSession,
            checkIsactive,
            checkRequestBodyParams('type').isIn(['1', '0']),
            checkRequestBodyParams('post_id'),
            validateRequest,
            add_like
)

router.post('/getLikedPosts',
            checkSession,
            checkRequestBodyParams('userId'),
            validateRequest,
            liked_post
)


module.exports = router