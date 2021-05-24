const express = require("express");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");

const {
  create_post,
  create_postNew,
  get_post,
  user_posts,
  delete_post,
  feeds,
  all_feeds,
  updateviewpost,
  createReport,
  exploreFeedsbyLocation,
} = require("../../controllers/User/Post");
const { checkSession } = require("../../middlewares/checkAuth");

router.post(
  "/post",
  checkSession,
  checkRequestBodyParams("user_id"),
  validateRequest,
  create_post
);

router.post(
  "/post_new",
  checkSession,
  checkRequestBodyParams("user_id"),
  validateRequest,
  create_postNew
);

// Get post by id
router.get(
  "/getPost",
  checkSession,
  checkQuery("post_id"),
  validateRequest,
  get_post
);

// Get user posts
router.get(
  "/postbyUid",
  checkSession,
  checkQuery("user_id"),
  validateRequest,
  user_posts
);

// Delete user Post
router.post(
  "/delete_post",
  checkSession,
  checkRequestBodyParams("post_id"),
  validateRequest,
  delete_post
);

// get single user feed
router.get(
  "/feeds",
  checkSession,
  checkQuery("user_id"),
  validateRequest,
  feeds
);

// Get feed posts
router.get("/all_feeds", checkSession, all_feeds);

//updateviewpost
router.post(
  "/updateviewpost",
  // checkSession,
  checkRequestBodyParams("post_id"),
  checkRequestBodyParams("user_id"),
  checkRequestBodyParams("postUserId"),
  validateRequest,
  updateviewpost
);

//createReport
router.post(
  "/createReport",
  // checkSession,
  checkRequestBodyParams("post_id"),
  checkRequestBodyParams("user_id"),
  checkRequestBodyParams("report"),
  validateRequest,
  createReport
);

//exploreFeedsbyLocation
router.get(
  "/exploreFeedsbyLocation",
  // checkSession,
  checkQuery("lat"),
  checkQuery("lng"),
  validateRequest,
  exploreFeedsbyLocation
);

module.exports = router;
