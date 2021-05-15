const express = require("express");
const { add_like } = require("../../controllers/User/like");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams,validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.post('/likePost',
            // checkSession,
            checkRequestBodyParams('type').isIn(['1', '0']),
            checkRequestBodyParams('post_id'),
            checkRequestBodyParams('user_id'),
            validateRequest,
            add_like
)


module.exports = router