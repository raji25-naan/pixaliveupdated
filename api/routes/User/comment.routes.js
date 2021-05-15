const express = require("express");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");

const { add_comment,getPost_comments,delete_comment } = require("../../controllers/User/Comment");
const { checkSession } = require("../../middlewares/checkAuth");

router.post("/comment",
              checkSession,
              checkRequestBodyParams("user_id"),
              checkRequestBodyParams("post_id"),
              checkRequestBodyParams("comment"),
              validateRequest,
              add_comment);

router.get("/getpost_comments",
            checkSession,
            checkQuery("post_id"),
            validateRequest,
            getPost_comments);

router.post("/delete_comment",
            checkSession,
            checkRequestBodyParams("comment_id"),
            validateRequest,
            delete_comment);

module.exports = router
