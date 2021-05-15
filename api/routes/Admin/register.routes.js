const express = require("express");
const { login } = require("../../controllers/Admin/register");
const router = express.Router();

router.post("/login",login)

module.exports = router