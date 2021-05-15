const express = require("express");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");

const {
  create_post,
  get_post,
  user_posts,
  delete_post,
  search_user,
  feeds,
  all_feeds,
} = require("../../controllers/User/Post");
const { checkSession } = require("../../middlewares/checkAuth");

router.post(
  "/post",
  checkSession,
  checkRequestBodyParams("user_id"),
  checkRequestBodyParams("thumbnail"),
  checkRequestBodyParams("image"),
  checkRequestBodyParams("body"),
  validateRequest,
  create_post
);

// Get post by id
router.get("/getPost",
          checkSession,
          checkQuery("post_id"),
          validateRequest,
          get_post);

// Get user posts
router.get("/postbyUid",
          checkSession,
          checkQuery("user_id"),
          validateRequest,
          user_posts);

// Delete user Post
router.post("/delete_post",
          checkSession,
          checkRequestBodyParams("post_id"),
          validateRequest,
          delete_post);

// get single user feed
router.get("/feeds",
          checkSession,
          checkQuery("user_id"),
          validateRequest,
          feeds);

// Get feed posts
router.get("/all_feeds",checkSession, all_feeds);

module.exports = router;
