const blocked = require("../models/User/blocked");
const hidePostSchema = require("../models/User/HidePost");
const postSchema = require("../models/User/Post");
const follow_unfollow = require("../models/User/follow_unfollow");
const Users = require("../models/User/Users");
const likeSchema = require("../models/User/like");
const sleep = require('sleep-promise');



module.exports.sendAllPost = async function(allPost, userId, res) {
    allPost.forEach(async (checkFeed, i) => {
      if (checkFeed.reloopPostId) {
        const user_id = userId;
        let post_id = checkFeed.reloopPostId
  
        //totalBlockedUser
        let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: user_id }).exec();
        let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: user_id }).exec();
        const totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
        //getHidePost
        let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: user_id }).exec();
        //all_Posts
        const all_Posts = await postSchema.findOne({
          _id: { $in: post_id, $nin: getHidePost },
          user_id: { $nin: totalBlockedUser },
          isActive: true,
          isDeleted: false
        },{_id:1,body:1,url:1,post_type:1,text_content:1,thumbnail:1,user_id:1,isLiked:1,created_at:1}).populate("user_id", "username avatar name private follow").exec();
        if (all_Posts) {
          //data_follower
          const data_follower = await follow_unfollow.distinct("followingId", {
            followerId: user_id, status: 1
          });
          var array1 = data_follower.map(String);
          var getAllId = [...new Set(array1)];
          //data_request
          const data_request = await follow_unfollow.distinct("followingId", {
            followerId: user_id, status: 0
          });
          var array2 = data_request.map(String);
          var requested = [...new Set(array2)];
          //follow1
          getAllId.forEach((followId) => {
            if (followId == all_Posts.user_id._id) {
              all_Posts.user_id.follow = 1;
            }
          });
          //follow2
          requested.forEach((followId) => {
            if (followId == all_Posts.user_id._id) {
              all_Posts.user_id.follow = 2;
            }
          });
          //get_like
          let get_like = await likeSchema.distinct("post_id", {
            user_id: user_id,
            isLike: 1,
          }).exec();
          let likedIds = get_like.map(String);
          likedIds.forEach((id) => {
            if (id == all_Posts._id) {
              all_Posts.isLiked = 1;
            }
          });
          // checkFeed.reloopPostId = all_Posts;
  
          sleep(1000).then(function () {
            checkFeed.reloopPostId = all_Posts;
          });
        }
        else
        {
          checkFeed.reloopPostId = "Loop not available";
        }
  
      }
      if (allPost.length == i + 1) {
        if (allPost.length <= 300) {
          sleep(5000).then(function () {
            console.log("finish300")
            return res.json({
              success: true,
              feeds: allPost,
              message: "Feeds fetched successfuly.."
            });
          });
        }
        else if (allPost.length <= 500) {
          sleep(6000).then(function () {
            console.log("finish500")
            return res.json({
              success: true,
              feeds: allPost,
              message: "Feeds fetched successfuly.."
            });
          });
        }
        else {
          sleep(7000).then(function () {
            console.log("finish501")
            return res.json({
              success: true,
              feeds: allPost,
              message: "Feeds fetched successfuly.."
            });
          });
        }
      }
    })
  }