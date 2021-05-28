const express = require("express");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");

const { add_comment,getPost_comments,delete_comment } = require("../../controllers/User/Comment");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkIsactive } = require("../../middlewares/checkActive");

router.post("/comment",
              checkSession,
              checkIsactive,
              checkRequestBodyParams("post_id"),
              checkRequestBodyParams("comment"),
              validateRequest,
              add_comment);

router.get("/getpost_comments",
            checkSession,
            checkIsactive,
            checkQuery("post_id"),
            validateRequest,
            getPost_comments);

router.post("/delete_comment",
            checkSession,
            checkIsactive,
            checkRequestBodyParams("comment_id"),
            validateRequest,
            delete_comment);

module.exports = router
