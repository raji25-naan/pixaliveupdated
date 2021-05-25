const express = require("express");
const { getAllPost } = require("../../controllers/Admin/post");
const router = express.Router();

router.get("/getAllPost",getAllPost);

module.exports = router;