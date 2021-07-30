const express = require("express");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");

const { add_comment,getPost_comments,delete_comment, addLiketoComment, editComment, addreplyComment, addLiketoReplyComment } = require("../../controllers/User/Comment");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkIsactive } = require("../../middlewares/checkActive");
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post("/comment",
              checkSession,
              checkIsactive,
              checkRequestBodyParams("post_id"),
              checkRequestBodyParams("comment"),
              validateRequest,
              catch_error(add_comment)
              );

router.post("/editComment",
              checkSession,
              checkIsactive,
              checkRequestBodyParams("comment_id"),
              checkRequestBodyParams("comment"),
              validateRequest,
              catch_error(editComment)
              );

router.get("/getpost_comments",
            checkSession,
            checkIsactive,
            checkQuery("post_id"),
            validateRequest,
            catch_error(getPost_comments)
            );

router.post("/delete_comment",
            checkSession,
            checkIsactive,
            checkRequestBodyParams("comment_id"),
            validateRequest,
            catch_error(delete_comment)
            );

//addLiketoComment
router.post("/addLiketoComment",
            checkSession,
            checkIsactive,
            checkRequestBodyParams("user_id"),
            checkRequestBodyParams("comment_id"),
            validateRequest,
            catch_error(addLiketoComment)
            );

//replyComment
router.post("/addreplyComment",
            checkSession,
            checkIsactive,
            checkRequestBodyParams("user_id"),
            checkRequestBodyParams("comment_id"),
            checkRequestBodyParams("replyComment"),
            validateRequest,
            catch_error(addreplyComment)
            );

//addLiketoReplyComment
router.post("/addLiketoReplyComment",
            checkSession,
            checkIsactive,
            checkRequestBodyParams("user_id"),
            checkRequestBodyParams("replyComment_id"),
            validateRequest,
            catch_error(addLiketoReplyComment)
            );

module.exports = router
