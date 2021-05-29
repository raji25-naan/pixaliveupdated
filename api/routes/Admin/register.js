const express = require("express");
const { login, getAllUsers, deactivateUser, activateUser, getUserDetail } = require("../../controllers/Admin/register");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams,validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.post("/login",login);

router.get("/getAllUsers",getAllUsers);

router.post("/activateUser",activateUser);

router.post("/deactivateUser",
            checkSession,
            checkRequestBodyParams('userId'),
            validateRequest,
            deactivateUser);

router.get("/getUserDetail",getUserDetail);

module.exports = router