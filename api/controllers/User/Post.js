const postSchema = require("../../models/User/Post");
const viewPost = require("../../models/User/viewPost");
const hashtagSchema = require("../../models/User/hashtags");
const reportPost = require("../../models/User/reportPost");
const follow_unfollow = require("../../models/User/follow_unfollow");
const likeSchema = require("../../models/User/like");
const jwt = require("jsonwebtoken");
const sleep = require('sleep-promise');
// const Cryptr = require('cryptr');
// const cryptr = new Cryptr('s');
const userTagpost = require("../../models/User/userTagpost");
const hidePostSchema = require("../../models/User/HidePost");
const { increasePost_Point, increaseReloop_Point } = require("./points");
const blocked = require("../../models/User/blocked");
const { sendNotification } = require("../../helpers/notification");
const notificationSchema = require("../../models/User/Notification");
const { sendAllPost, checkNotification } = require("../../helpers/post");
const Hashids = require("hashids");
const hashids = new Hashids();

// ************* Create post Using user_Id ***************//

exports.create_postNew = async (req, res, next) => {

  const { text, url, body, thumbnail, type, privacyType, tagged_userId, category,media_datatype } = req.body;
  const user_id = req.user_id;
  let place;
  if (req.body.place) {
    place = req.body.place.toLowerCase();
  }
  //hashSplit
  let arr_hash;
  if (body) {
    arr_hash = body.match(/(^|\s)#(\w+)/g);
  }
  var hash_tag = [];
  if (arr_hash) {
    arr_hash = arr_hash.map(function (v) {
      return v.trim().substring(1);
    });
    hash_tag.push(...arr_hash);
    const get_hashtag = await hashtagSchema.distinct("hashtag", {
      hashtag: arr_hash,
    });
    hash_tags = new Set(get_hashtag.map((tag) => tag));

    arr_hash = arr_hash.filter((id) => !hash_tags.has(id));

    arr_hash.forEach(async (element) => {
      const hashtag = new hashtagSchema({
        hashtag: element,
        created_at: new Date(),
      }).save();
    });
  }


  if (type == 1 || type == 2 || type == 3)
    update_postwithType(
      user_id,
      url,
      "",
      thumbnail,
      body,
      place,
      type,
      hash_tag,
      privacyType,
      tagged_userId,
      category,
      media_datatype,
      res
    );
  if (type == 4)
    update_postwithType(
      user_id,
      "",
      text,
      thumbnail,
      body,
      place,
      type,
      hash_tag,
      privacyType,
      tagged_userId,
      category,
      media_datatype,
      res
    );
};

async function update_postwithType(
  userId,
  url,
  text,
  thumbnail,
  body,
  place,
  type,
  hashtag,
  privacyType,
  tagged_userId,
  category,
  media_datatype,
  res
) {
  try {
    const createdPost = await new postSchema({
      user_id: userId,
      url: url,
      text_content: text,
      thumbnail: thumbnail,
      body: body,
      place: place,
      post_type: type,
      hashtag: hashtag,
      privacyType: privacyType,
      tagged_userId: tagged_userId,
      category: category,
      media_datatype: media_datatype,
      isActive: true,
      created_at: Date.now(),
    }).save();

    if (createdPost) {
      let userId = createdPost.user_id;
      let postId = String(createdPost._id);
      let encryptdId = hashids.encodeHex(postId);
      const updateEncryptId = await postSchema.findOneAndUpdate(
        { _id: postId },
        {
          $set: { encryptId: encryptdId }
        },
        { new: true }
      ).exec();


      increasePost_Point(userId);
      if (tagged_userId.length > 0) {
        tagged_userId.forEach(async (element) => {

          const saveTagged = new userTagpost({
            post_id: createdPost._id,
            tagged_userId: element,
            taggedByuserId: createdPost.user_id
          });
          await saveTagged.save();
        })
      }

      return res.json({
        success: true,
        result: createdPost,
        message: "loop added successfully"
      });
    }
    else {
      return res.json({
        success: false,
        message: "Error adding loop" + error,
      });
    }

  } catch (error) {
    return res.json({
      success: false,
      message: "Error adding loop" + error,
    });
  }
}

//reloopPost
exports.reloopPost = async (req, res, next) => {

  const { text, url, body, thumbnail, type, privacyType, category } = req.body;
  const user_id = req.user_id;
  let reloopPostId = req.body.post_id;
  //checkIspublic
  const checkIspublic = await postSchema.findOne({ _id: reloopPostId }).exec();
  if (checkIspublic.privacyType == "public") {
    let place;
    if (req.body.place) {
      place = req.body.place.toLowerCase();
    }
    //hashSplit
    let arr_hash;
    if (body) {
      arr_hash = body.match(/(^|\s)#(\w+)/g);
      console.log(arr_hash);
    }
    var hash_tag = [];
    if (arr_hash) {
      arr_hash = arr_hash.map(function (v) {
        return v.trim().substring(1);
      });
      hash_tag.push(...arr_hash);
      const get_hashtag = await hashtagSchema.distinct("hashtag", {
        hashtag: arr_hash,
      });
      hash_tags = new Set(get_hashtag.map((tag) => tag));

      arr_hash = arr_hash.filter((id) => !hash_tags.has(id));

      arr_hash.forEach(async (element) => {
        const hashtag = new hashtagSchema({
          hashtag: element,
          created_at: new Date(),
        }).save();
      });
    }

    if (type == 1 || type == 2 || type == 3)
      updateReloopwithPostType(
        user_id,
        url,
        "",
        thumbnail,
        body,
        place,
        type,
        hash_tag,
        privacyType,
        reloopPostId,
        category,
        res
      );
    if (type == 4)
      updateReloopwithPostType(
        user_id,
        "",
        text,
        thumbnail,
        body,
        place,
        type,
        hash_tag,
        privacyType,
        reloopPostId,
        category,
        res
      );
  }
  else {
    return res.json({
      success: false,
      message: "This is not a public post!You cant reloop"
    });
  }

}

async function updateReloopwithPostType(
  userId,
  url,
  text,
  thumbnail,
  body,
  place,
  type,
  hashtag,
  privacyType,
  reloopPostId,
  category,
  res
) {
  try {
    const createdReloop = await new postSchema({
      user_id: userId,
      url: url,
      text_content: text,
      thumbnail: thumbnail,
      body: body,
      place: place,
      post_type: type,
      hashtag: hashtag,
      privacyType: privacyType,
      reloopPostId: reloopPostId,
      category: category,
      isActive: true,
      created_at: Date.now(),
    }).save();

    if (createdReloop) {
      //updateReloopCount

      let postId = String(createdReloop._id);
      let encryptdId = hashids.encodeHex(postId);
      const updateEncryptId = await postSchema.findOneAndUpdate(
        { _id: postId },
        {
          $set: { encryptId: encryptdId }
        },
        { new: true }
      ).exec();

      const updateReloopCount = await postSchema.findOneAndUpdate(
        { _id: reloopPostId },
        {
          $inc: { reloopCount: 1 }
        },
        { new: true }
      ).exec();

      if (updateReloopCount) {
        let userId = updateReloopCount.user_id;
        increaseReloop_Point(userId);
        //Notification
        const senderDetails1 = await postSchema.find({ reloopPostId: reloopPostId }, { _id: 0, user_id: 1 }).sort({ created_at: -1 });
        const arraysorting = [];
        senderDetails1.forEach((values) => {
          arraysorting.push(values["user_id"])
        })
        const all_ID = arraysorting.map(String);
        const totalId = [...new Set(all_ID)];

        const updateNotification = new notificationSchema({
          sender_id: createdReloop.user_id,
          receiver_id: updateReloopCount.user_id,
          post_id: reloopPostId,
          type: 6,
          seen: false,
          created_at: Date.now()
        });
        const saveNotificationData = await updateNotification.save();
        if (saveNotificationData) 
        {
          var checkNotify = await checkNotification(userId);
          if(checkNotify == true)
          {
            sendNotification(totalId, userId, 6);
          }
          return res.json({
            success: true,
            result: createdReloop,
            message: "Relooped successfully"
          });
        }

      }
    }
    else {
      return res.json({
        success: false,
        message: "Error occured in reloop " + error
      });
    }
  }
  catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error
    });
  }

}

// ************* Get post Using Post_id ***************//
exports.get_post = async (req, res, next) => {

  const user_id = req.user_id;
  let post_id;
  if (req.query.post_id) {
    post_id = req.query.post_id;
  }
  else if (req.query.encryptId) {
    post_id = hashids.decodeHex(req.query.encryptId);
  }
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
  }).populate("user_id", "username avatar name private follow").exec();
  if (all_Posts) 
  {
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
    //get_like
    let get_like = await likeSchema.distinct("post_id", {
      user_id: user_id,
      isLike: 1,
    }).exec();
    let likedIds = get_like.map(String);

    //check
    if(getAllId.length)
    {
      setFollow1();
    }
    else if(requested.length)
    {
      setFollow2();
    }
    else if(likedIds.length)
    {
      setisLiked();
    }
    else
    {
      sendToResponse();
    }

    //setFollow1
    function setFollow1()
    {
      var count1 = 0;
      getAllId.forEach((followId) => {
        if(followId == all_Posts.user_id._id) 
        {
          all_Posts.user_id.follow = 1;
        }
        count1 = count1 + 1;
        if(getAllId.length == count1)
        {
          if(requested.length)
          {
            setFollow2();
          }
          else if(likedIds.length)
          {
            setisLiked();
          }
          else
          {
            sendToResponse();
          }
        }
      });
    }

    //setFollow2
    function setFollow2()
    {
      var count2 = 0;
      requested.forEach((followId) => {
        if(followId == all_Posts.user_id._id) 
        {
          all_Posts.user_id.follow = 2;
        }
        count2 = count2 + 1;
        if(requested.length == count2)
        {
          if(likedIds.length)
          {
            setisLiked();
          }
          else
          {
            sendToResponse();
          }
        }
      });
    }

    //setisLiked
    function setisLiked()
    {
      var count3 = 0;
      likedIds.forEach((id) => {
        if(id == all_Posts._id) 
        {
          all_Posts.isLiked = 1;
        }
        count3 = count3 + 1;
        if(likedIds.length == count3)
        {
          sendToResponse();
        }
      });
    }
    
    //sendToResponse
    function sendToResponse()
    {
      sendreloopedPost(all_Posts, user_id, getAllId, requested, likedIds, res);
    }
  }
  else 
  {
    return res.json({
      success: false,
      message: "loop not available"
    });
  }
};

async function sendreloopedPost(allPost, userId, getAllId, requested, likedIds, res) {
  if (allPost.reloopPostId) 
  {
    const user_id = userId;
    let post_id = allPost.reloopPostId

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
    },{_id:1,body:1,url:1,post_type:1,text_content:1,thumbnail:1,user_id:1,isLiked:1,media_datatype:1,created_at:1}).populate("user_id", "username avatar name private follow").exec();
    if (all_Posts) 
    {
      //data_follower
      // const data_follower = await follow_unfollow.distinct("followingId", {
      //   followerId: user_id, status: 1
      // });
      // var array1 = data_follower.map(String);
      // var getAllId = [...new Set(array1)];
      //data_request
      // const data_request = await follow_unfollow.distinct("followingId", {
      //   followerId: user_id, status: 0
      // });
      // var array2 = data_request.map(String);
      // var requested = [...new Set(array2)];
      //get_like
      // let get_like = await likeSchema.distinct("post_id", {
      //   user_id: user_id,
      //   isLike: 1,
      // }).exec();
      // let likedIds = get_like.map(String);

      //check
      if(getAllId.length)
      {
        setFollow1();
      }
      else if(requested.length)
      {
        setFollow2();
      }
      else if(likedIds.length)
      {
        setisLiked();
      }
      else
      {
        Response();
      }

      //setFollow1
      function setFollow1()
      {
        var count1 = 0;
        getAllId.forEach((followId) => {
          if(followId == all_Posts.user_id._id) 
          {
            all_Posts.user_id.follow = 1;
          }
          count1 = count1 + 1;
          if(getAllId.length == count1)
          {
            if(requested.length)
            {
              setFollow2();
            }
            else if(likedIds.length)
            {
              setisLiked();
            }
            else
            {
              Response();
            }
          }
        });
      }

      //setFollow2
      function setFollow2()
      {
        var count2 = 0;
        requested.forEach((followId) => {
          if(followId == all_Posts.user_id._id) 
          {
            all_Posts.user_id.follow = 2;
          }
          count2 = count2 + 1;
          if(requested.length == count2)
          {
            if(likedIds.length)
            {
              setisLiked();
            }
            else
            {
              Response();
            }
          }
        });
      }

      //setisLiked
      function setisLiked()
      {
        var count3 = 0;
        likedIds.forEach((id) => {
          if(id == all_Posts._id) 
          {
            all_Posts.isLiked = 1;
          }
          count3 = count3 + 1;
          if(likedIds.length == count3)
          {
            Response();
          }
        });
      }

      //Response
      function Response()
      {
        allPost.reloopPostId = all_Posts;
        return res.json({
          success: true,
          feeds: allPost,
          message: "Feeds fetched successfuly.."
        });
      }

    }
    else
    {
      return res.json({
        success: true,
        feeds: allPost,
        message: "Feeds fetched successfuly.."
      });
    }
  }
  else
  {
    return res.json({
      success: true,
      feeds: allPost,
      message: "Feeds fetched successfuly.."
    });
  }
}


// Get user feeds using user_id and fix offset
exports.feeds = async (req, res, next) => {

    const user_id = req.user_id;
    const offset = req.query.offset;
    var row = 10;
    //data_follower
    const data_follower = await follow_unfollow.distinct("followingId", { followerId: user_id, status: 1 }).exec();
    const stringFollowerId = data_follower.map(String);
    data_follower.push(user_id);
    var array1 = data_follower.map(String);
    var getAllId = [...new Set(array1)];
    //data_request
    const data_request = await follow_unfollow.distinct("followingId", { followerId: user_id, status: 0 }).exec();
    var array2 = data_request.map(String);
    var requested = [...new Set(array2)];
    //getReloopPostIdswithoutBody
    let reloopPostIds = await postSchema.distinct("reloopPostId", { user_id: user_id }).exec();
    let relooppostIdsWithoutbody = await postSchema.distinct("_id", { user_id: user_id, reloopPostId: reloopPostIds, body: "" }).exec();

    //getHidePost
    let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: user_id }).exec();
    let totalHideandBlockPostId = relooppostIdsWithoutbody.concat(getHidePost);
    //getBlockedUsers
    let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: user_id }).exec();
    let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: user_id }).exec();
    let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);

    const all_feeds = await(await postSchema
      .find({
        user_id: { $in: getAllId, $nin: totalBlockedUser },
        _id: { $nin: totalHideandBlockPostId },
        privacyType: { $nin: "onlyMe" },
        isActive: true,
        isDeleted: false
      }).populate("user_id", "username name avatar private follow").sort({ created_at: -1 })).splice(offset == undefined ? 0 : offset, row);
  // const all_feeds = await postSchema.find({
  //   user_id: { $in: getAllId, $nin: totalBlockedUser },
  //   _id: { $nin: totalHideandBlockPostId },
  //   privacyType: { $nin: "onlyMe" },
  //   isActive: true,
  //   isDeleted: false
  // }).populate("user_id", "username name avatar private follow").sort({ created_at: -1 }).exec();
    if (all_feeds.length > 0) 
    {
      let get_like = await likeSchema.distinct("post_id", {
        user_id: user_id,
        isLike: 1,
      }).exec();
      let likedIds = get_like.map(String);
      //follow1
      if(stringFollowerId.length)
      {
        setFollow1();
      }
      else if(requested.length)
      {
        setFollow2();
      }
      else if(likedIds.length)
      {
        setisLiked();
      }
      else
      {
        sendtoResponse();
      }
      //setFollow1
      function setFollow1()
      {
        var count1 = 0;
        var totalLength1 = all_feeds.length * stringFollowerId.length;
        all_feeds.forEach((data) => {
          stringFollowerId.forEach((followId) => {
            if (followId == data.user_id._id) 
            {
              data.user_id.follow = 1;
            }
            count1 = count1 + 1;
            if(totalLength1 == count1)
            {
              if(requested.length)
              {
                setFollow2();
              }
              else if(likedIds.length)
              {
                setisLiked();
              }
              else
              {
                sendtoResponse();
              }
            }
          })
        })
      }
      //setFollow2
      function setFollow2()
      {
        var count2 = 0;
        var totalLength2 = all_feeds.length * requested.length;
        all_feeds.forEach((data) => {
          requested.forEach((followId) => {
            if (followId == data.user_id._id) 
            {
              data.user_id.follow = 2;
            }
            count2 = count2 + 1;
            if(totalLength2 == count2)
            {
              if(likedIds.length)
              {
                setisLiked();
              }
              else
              {
                sendtoResponse();
              }
            }
          })
        })
      }
      
      //setisLiked
      function setisLiked()
      {
        var count3 = 0;
        var totalLength3 = all_feeds.length * likedIds.length;
        all_feeds.forEach((post) => {
          likedIds.forEach((id) => {
            if (id == post._id) 
            {
              post.isLiked = 1;
            }
            count3 = count3 + 1;
            if(totalLength3 == count3)
            {
              sendtoResponse();
            }
          });
        });
      }

      function sendtoResponse()
      {
        sendAllPost(all_feeds, user_id, res)
      }
    }
    else {
    return res.json({
      success: true,
      feeds: all_feeds,
      message: "No Feeds"

    });
    }
};

// async function sendAllPost(allPost, userId, res) {
//   allPost.forEach(async (checkFeed, i) => {
//     if (checkFeed.reloopPostId) {
//       const user_id = userId;
//       let post_id = checkFeed.reloopPostId

//       //totalBlockedUser
//       let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: user_id }).exec();
//       let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: user_id }).exec();
//       const totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
//       //getHidePost
//       let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: user_id }).exec();
//       //all_Posts
//       const all_Posts = await postSchema.findOne({
//         _id: { $in: post_id, $nin: getHidePost },
//         user_id: { $nin: totalBlockedUser },
//         isActive: true,
//         isDeleted: false
//       }).populate("user_id", "username avatar name private follow").exec();
//       if (all_Posts) {
//         //data_follower
//         const data_follower = await follow_unfollow.distinct("followingId", {
//           followerId: user_id, status: 1
//         });
//         var array1 = data_follower.map(String);
//         var getAllId = [...new Set(array1)];
//         //data_request
//         const data_request = await follow_unfollow.distinct("followingId", {
//           followerId: user_id, status: 0
//         });
//         var array2 = data_request.map(String);
//         var requested = [...new Set(array2)];
//         //follow1
//         getAllId.forEach((followId) => {
//           if (followId == all_Posts.user_id._id) {
//             all_Posts.user_id.follow = 1;
//           }
//         });
//         //follow2
//         requested.forEach((followId) => {
//           if (followId == all_Posts.user_id._id) {
//             all_Posts.user_id.follow = 2;
//           }
//         });
//         //get_like
//         let get_like = await likeSchema.distinct("post_id", {
//           user_id: user_id,
//           isLike: 1,
//         }).exec();
//         let likedIds = get_like.map(String);
//         likedIds.forEach((id) => {
//           if (id == all_Posts._id) {
//             all_Posts.isLiked = 1;
//           }
//         });
//         // checkFeed.reloopPostId = all_Posts;

//         sleep(1000).then(function () {
//           checkFeed.reloopPostId = all_Posts;
//         });
//       }
//       else
//       {
//         checkFeed.reloopPostId = "Loop not available";
//       }

//     }
//     if (allPost.length == i + 1) {
//       if (allPost.length <= 300) {
//         sleep(5000).then(function () {
//           console.log("finish300")
//           return res.json({
//             success: true,
//             feeds: allPost,
//             message: "Feeds fetched successfuly.."
//           });
//         });
//       }
//       else if (allPost.length <= 500) {
//         sleep(6000).then(function () {
//           console.log("finish500")
//           return res.json({
//             success: true,
//             feeds: allPost,
//             message: "Feeds fetched successfuly.."
//           });
//         });
//       }
//       else {
//         sleep(7000).then(function () {
//           console.log("finish501")
//           return res.json({
//             success: true,
//             feeds: allPost,
//             message: "Feeds fetched successfuly.."
//           });
//         });
//       }
//     }
//   })
// }

// sort by date
function sortFunction(a, b) {
  var dateA = new Date(a.date).getTime();
  var dateB = new Date(b.date).getTime();
  return dateA > dateB ? 1 : -1;
}

//updateviewPost
exports.updateviewpost = async (req, res, next) => {
  let { post_id, postUserId } = req.body;
  let user_id = req.user_id;
  //getViewdata
  const getViewdata = await viewPost
    .find({
      post_id: post_id,
      viewed_userId: user_id,
      post_userID: postUserId,
    })
    .exec();
  if (getViewdata.length > 0) {
    return res.json({
      success: false,
      message: "Already viewed",
    });
  } else {
    const data = new viewPost({
      post_id: post_id,
      viewed_userId: user_id,
      post_userID: postUserId,
    });
    const saveData = await data.save();
    if (saveData) {
      return res.json({
        success: true,
        message: "Post viewed successfully",
      });
    }
  }
};

//createReport
exports.createReport = async (req, res, next) => {
  const { post_id, report } = req.body;
  const user_id = req.user_id;
  const reports = new reportPost({
    post_id: post_id,
    reportedByid: user_id,
    report: report,
  });
  const saveReport = await reports.save();
  if (saveReport) {
    return res.json({
      success: true,
      message: "Reported successfully",
    });
  } else {
    return res.json({
      success: false,
      msg: "Your report is not taken..try again!",
    });
  }
};

//getPostsbycategory
// exports.getPostsbycategory = async (req, res, next) => {
//   try 
//   {
//     let { post_id } = req.query;
//     let user_id = req.user_id;
//     const postData = await postSchema.findOne({ _id: post_id, isActive: true });
//     if (postData) {
//       const onlycategory = postData.category;
//       //getBlockedUsers
//       let getBlockedUsers = await blocked.distinct("Blocked_user",{Blocked_by: user_id }).exec();

//       const allcategory = await postSchema.find({
//         category: onlycategory,
//         user_id: {$nin: getBlockedUsers},
//         isActive: true,
//         isDeleted: false
//       }).exec();
//       if (allcategory.length > 0) 
//       { 
//         const following = await follow_unfollow.distinct("followingId", {
//           followerId: user_id,status: 1
//         }).exec();
//         const all_ID = following.map(String);
//         const totalId = [...new Set(all_ID)];
//         allcategory.forEach((data) => {
//           totalId.forEach((followerUserId) => {
//             if (followerUserId == data.user_id) {
//               data.follow = 1;
//             }
//           });
//         });
//         return res.json({
//           success: true,
//           result: allcategory,
//           message: "Posts fetched successfuly by category",
//         });
//       } else {
//         return res.json({
//           success: false,
//           msg: "No posts"
//         });
//       }
//     } else {
//       return res.json({
//         success: false,
//         msg: "No posts related to this category",
//       });
//     }
//   } catch (error) {
//     return res.json({
//       success: false,
//       msg: "error occured" + error,
//     });
//   }
// };

//getPostByhashtag

//hidePost
exports.hidePost = async (req, res, next) => {
  const { post_id } = req.body;
  const user_id = req.user_id;
  const hidepost = new hidePostSchema({
    post_id: post_id,
    hideByid: user_id,
    created_at: Date.now()
  });
  const saveData = await hidepost.save();
  if (saveData) {
    return res.json({
      success: true,
      message: "Loop hided successfully"
    });
  }
  else {
    return res.json({
      success: false,
      message: "error occured!" + error
    });
  }
}

//editPost
exports.editPost = async (req, res, next) => {

  let user_id = req.user_id;
  let { post_id, body, tagged_userId, privacyType, category, media_datatype } = req.body;

  let arr_hash;
  if (body) {
    arr_hash = body.match(/(^|\s)#(\w+)/g);
    console.log(arr_hash);
  }

  var hash_tag = [];

  if (arr_hash) {
    arr_hash = arr_hash.map(function (v) {
      return v.trim().substring(1);
    });

    hash_tag.push(...arr_hash);
    const get_hashtag = await hashtagSchema.distinct("hashtag", {
      hashtag: arr_hash,
    });

    hash_tags = new Set(get_hashtag.map((tag) => tag));

    arr_hash = arr_hash.filter((id) => !hash_tags.has(id));

    arr_hash.forEach(async (element) => {
      const hashtag = new hashtagSchema({
        hashtag: element,
        created_at: new Date(),
      }).save();
    });
  }

  const postEdited = await postSchema.findOneAndUpdate(
    { _id: post_id },
    {
      $set:
      {
        body: body,
        hashtag: hash_tag,
        tagged_userId: tagged_userId,
        privacyType: privacyType,
        category: category,
        media_datatype: media_datatype
      }
    }, { new: true }).exec();

  if (postEdited) {
    if (tagged_userId.length) {
      const deleted = await userTagpost.deleteMany({ post_id: post_id });
      console.log(deleted)
      if (deleted) {
        tagged_userId.forEach(async (element) => {

          const saveTagged = new userTagpost({
            post_id: post_id,
            tagged_userId: element,
            taggedByuserId: user_id
          });
          await saveTagged.save();
        })
      }
    }
    sleep(1000).then(function () {
      return res.json({
        success: true,
        result: postEdited,
        message: "Loop edited successfully"
      });
    });

  }
  else {
    return res.json({
      success: false,
      message: "error occured!" + error
    })
  }
}

// Edit privacy using Post ID

exports.edit_privacy = async (req, res, next) => {

  const post_id = req.body.post_id;
  const privacy_type = req.body.privacy_type;

  const update_post = await postSchema.findByIdAndUpdate(
    { _id: post_id },
    {
      $set: {
        privacyType: privacy_type,
      },
    },

    { new: true }
  )

  if (update_post) {
    res.json({
      success: true,
      result: update_post,
      message: "PrivacyType successfully updated"
    })
  }
}

// Delete the post
exports.delete_post_New = async (req, res, next) => {
  const post_id = req.body.post_id;
  //updateDeleted
  const updateDeleted = await postSchema.updateOne(
    { _id: post_id },
    {
      $set: { isDeleted: true }
    },
    { new: true }
  ).exec();
  if (updateDeleted) {
    res.json({
      success: true,
      message: "Loop deleted successfully"
    })
  }
  else {
    res.json({
      success: false,
      message: "Loop not delete"
    })
  }
}

//createShare
exports.createShare = async (req, res, next) => {

  if (req.query.encryptId) {
    let post_id = hashids.decodeHex(req.query.encryptId);
    const get_Post = await postSchema.findOne({ _id: post_id, isActive: true, isDeleted: false }).populate("user_id", "username avatar name private follow").exec();
    if (get_Post.post_type == 1) {
      return res.send(
        `<!DOCTYPE html>
          <html> 
            <head>
              <style type="text/css" >
                html {
                  overflow: auto;
                }
                html, body, div, iframe {
                  margin: 0px;
                  padding: 0px;
                  height: 100%;
                  border: none;
                }
                iframe {
                  display: block;
                  width: 100%;
                  border: none;
                  overflow-y: auto;
                  overflow-x: hidden;
                }
              </style>
              <title> ${get_Post.user_id.username}  ${get_Post.body}  <a href = "https://pixalive.me/" >pixalive.me</a> </title> <link rel="icon" href="${get_Post.thumbnail}"> 
            </head>
            <body> <iframe src = "https://pixalive.me" frameborder="0" marginheight="0" marginwidth="0" width="100%" height="100%" scrolling="auto" ></iframe> </body>
          </html>`
      )
    }
    else if (get_Post.post_type == 3) {
      return res.send(
        `<!DOCTYPE html>
          <html>
            <head>
              <style type="text/css" >
                html {
                  overflow: auto;
                }
                html, body, div, iframe {
                  margin: 0px;
                  padding: 0px;
                  height: 100%;
                  border: none;
                }
                iframe {
                  display: block;
                  width: 100%;
                  border: none;
                  overflow-y: auto;
                  overflow-x: hidden;
                }
              </style>
              <title> ${get_Post.user_id.username}  ${get_Post.body} pixalive.me </title> <link rel="icon" href="${get_Post.url}"> 
            </head>
            <body> <iframe src = "https://pixalive.me" frameborder="0" marginheight="0" marginwidth="0" width="100%" height="100%" scrolling="auto" ></iframe> </body>
          </html>`
      )
    }
    else {
      return res.json({
        success: false,
        message: "Post Unavailable"
      })
    }

  }
  else {
    return res.json({
      success: false,
      message: "Please send encrypt Id"
    })
  }

}