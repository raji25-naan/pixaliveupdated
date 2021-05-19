const express = require("express");
const { tagged_post } = require("../../controllers/User/userTagpost");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams, validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.post("/getTaggedPost",
            checkSession,
            checkRequestBodyParams("userId"),
            validateRequest,
            tagged_post
)

module.exports = router;
