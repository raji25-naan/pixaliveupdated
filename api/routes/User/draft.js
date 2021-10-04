const express = require("express");
const { savePostToDraft, deleteDraftPost, getDraftPosts, editDraftPost } = require("../../controllers/User/draft");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");
const { oneOf } = require("express-validator/check");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkIsactive } = require("../../middlewares/checkActive");
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

//savePostToDraft
router.post(
    "/savePostToDraft",
    checkSession,
    checkIsactive,
    oneOf([checkRequestBodyParams("url"), checkRequestBodyParams("text")]),
    validateRequest,
    catch_error(savePostToDraft)
  );

//editDraftPost
  router.post(
    "/editDraftPost",
    checkSession,
    checkIsactive,
    checkRequestBodyParams("draft_id"),
    validateRequest,
    catch_error(editDraftPost)
  );

//deleteDraftPost
router.post(
    "/deleteDraftPost",
    checkSession,
    checkIsactive,
    checkRequestBodyParams("draft_id"),
    validateRequest,
    catch_error(deleteDraftPost)
  );

//getDraftPosts
router.get(
    "/getDraftPosts",
    checkSession,
    checkIsactive,
    catch_error(getDraftPosts)
)


module.exports = router;