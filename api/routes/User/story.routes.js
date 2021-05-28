const express = require("express");
const {updateViewedStories, getStory, StoriesUpload } = require("../../controllers/User/story");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");

  router.post(
    "/updateViewedStories",
    checkSession,
    checkIsactive,
    checkRequestBodyParams("storyId"),
    validateRequest,
    updateViewedStories
  );

  router.post(
    "/addStories",
    checkSession,
    checkIsactive,
    checkRequestBodyParams("url"),
    validateRequest,
    StoriesUpload
);

router.get(
  "/getStory",
  checkSession,
  checkIsactive,
  getStory
);

module.exports = router