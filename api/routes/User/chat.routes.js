const express = require("express");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");

const {} = require("../../controllers/User/chat");

module.exports = router;
