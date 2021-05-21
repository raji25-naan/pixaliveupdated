const express = require("express");
const { login, getAllUsers, deactivateUser, activateUser } = require("../../controllers/Admin/register");
const router = express.Router();

router.post("/login",login);

router.get("/getAllUsers",getAllUsers);

router.post("/activateUser",activateUser);

router.post("/deactivateUser",deactivateUser);

module.exports = router