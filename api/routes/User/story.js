const express = require("express");
const { StoriesUpload, updateViewedStories, getStory } = require("../../controllers/User/story");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");

router.post(
    "/addStories",
    checkSession,
    checkRequestBodyParams("userId"),
    checkRequestBodyParams("url"),
    validateRequest,
    StoriesUpload
  );

  router.post(
    "/updateViewedStories",
    checkSession,
    checkRequestBodyParams("userId"),
    checkRequestBodyParams("storyId"),
    validateRequest,
    updateViewedStories
  );

  router.get(
    "/getStory",
    checkSession,
    checkQuery("user_id"),
    validateRequest,
    getStory
  );
  

module.exports = router