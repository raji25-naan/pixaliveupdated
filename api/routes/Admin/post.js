const express = require("express");
const { getAllPost, getPostDetail } = require("../../controllers/Admin/post");
const { checkQuery, validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.get("/getAllPost",getAllPost);

router.get("/getPostDetail",checkQuery("post_id"),validateRequest,getPostDetail)

module.exports = router;