const express = require("express");
const {updateViewedStories, getStory, StoriesUpload } = require("../../controllers/User/story");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");
const checkSession = require("../../middlewares/checkAuth");

  // router.post(
  //   "/updateViewedStories",
  //   checkSession,
  //   checkRequestBodyParams("userId"),
  //   checkRequestBodyParams("storyId"),
  //   validateRequest,
  //   updateViewedStories
  // );

  router.post(
    "/addStories",
    checkRequestBodyParams("userId"),
    checkRequestBodyParams("url"),
    validateRequest,
    StoriesUpload
);

// router.get(
//   "/getStory",
//   checkSession,
//   checkQuery("user_id"),
//   validateRequest,
//   getStory
// );

module.exports = router