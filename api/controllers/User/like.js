const Like = require('../../models/User/like');
const Post = require('../../models/User/Post');
const notificationSchema = require('../../models/User/Notification');
const TagPost = require('../../models/User/userTagpost');
const { sendNotification } = require('../../helpers/notification');
const follow_unfollow = require('../../models/User/follow_unfollow');
const sleep = require('sleep-promise');
const User = require('../../models/User/Users');

exports.add_like = async (req, res, next) => {

      let user_id = req.user_id;
      let {post_id } = req.body; 
      //checkLiked
      const checkLiked = await Like.findOne({
        post_id: post_id,
        user_id: user_id,
        isLike : 1
      }).exec();
      if(req.body.type == 1)
      {
        if (checkLiked !== null) 
        {
          console.log("Already Liked")
          return res.json({
            success: false,
            message: "Already existing... Check !!!"
          })
        }
        else
        {
          //Update like
          const updateLike = new Like({
            post_id: post_id,
            user_id: user_id,
            isLike : 1,
            created_at: Date.now(),
            });
            const saveData = await updateLike.save();
            if(saveData)
            {
                //update likeCount
                const updateLikeCount = await Post.updateOne(
                        {_id : post_id},
                        {$inc : {likeCount :1}},
                        {new :true}
                );
                if(updateLikeCount)
                {
                  const LikePost = await Post.findOne({ _id: post_id });
                  if (user_id != LikePost.user_id) 
                    {
                    const senderDetails1 = await Like.find({post_id:post_id},{_id:0,user_id:1}).sort({created_at:-1})
                    const arraysorting = [];
                    senderDetails1.forEach((values)=>{
                      arraysorting.push(values["user_id"])
                      console.log(arraysorting)
                    })
                  
                  const all_ID = arraysorting.map(String); 
                  const totalId = [...new Set(all_ID)];
                  console.log(totalId)
                    const updateNotification = new notificationSchema({
                      sender_id: user_id,
                      receiver_id: LikePost.user_id,
                      post_id: post_id,
                      type:0,
                      seen: false,
                      created_at:Date.now()
                    });
                    
                    const saveNotificationData = await updateNotification.save();
                    if (saveNotificationData) {
                      sendNotification(totalId, LikePost.user_id,0);
                        return res.json({
                        success: true,
                        message:"Like added and notification Sent"
                    });
                  }
                  }
                }
                else
                {
                    return res.json({
                        success:false,
                        message:"Error In liking loop"
                    })
                }
            }
            else
            {
              return res.json({
                success:false,
                message:"Error In liking loop"
              })
            } 
        }
      }
      else if(req.body.type == 0)
      {
        if (checkLiked !== null)
        {
            //deleteLike
            const deleteLike = await Like.findOneAndDelete({
              post_id: post_id,
              user_id: user_id,
            });
            if(deleteLike)
            {
              //update likeCount
              const updateLikeCount = await Post.updateOne(
                {_id : post_id},
                {$inc : {likeCount : -1}},
                {new :true}
              );
              if(updateLikeCount)
              {
                  return res.json({
                      success: true,
                      message:"unlike successfully"
                  })
              }
            }
        }
        else
        {
          return res.json({
            success: false,
            message: "Not an existing ... Check !!!"
          })
        }
      }  
  }

exports.liked_post = async (req,res,next) => {

          let {userId} = req.user_id;
     
          const likedPostId = await Like.distinct("post_id",{user_id:userId}).exec();
          //getPosts
          const getPosts = await Post.find({_id:likedPostId,isActive:true}).exec();
            if(getPosts){
              return res.json({
                success:true,
                results:getPosts,
                message:"Liked loops fetched successfully"
              })
            }
            else{
              return res.json({
                success:false,
                message:"No data found"
              })
            }
  }

//liked_user
exports.liked_user = async (req, res, next) => {
    let current_user_id = req.user_id;
    let post_id = req.query.post_id;
    //likedUserId
    let likedUserId = await Like.distinct("user_id",{post_id: post_id}).exec();
    const get_likedPost = await User.find({_id: likedUserId},{_id: 1,username: 1,name: 1, follow: 1, private: 1, avatar: 1}).exec();
       
    if (get_likedPost.length) {
      //follower_data
      const follower_data = await follow_unfollow.distinct("followingId", {
        followerId: current_user_id,
        status: 1
      });
      var change_string = follower_data.map(String);
      var getAll_Id = [...new Set(change_string)];
      //request_data_main
      const request_data_main = await follow_unfollow.distinct("followingId", {
        followerId: current_user_id,
        status: 0
      });
      var requestData = request_data_main.map(String);
      var requested = [...new Set(requestData)];
   
      //check
      if(getAll_Id.length)
      {
          setFollow1();
      }
      else if(requested.length)
      {
          setFollow2();
      }
      else
      {
          Response();
      }

      //setFollow1
      function setFollow1()
      {
        var count1 = 0;
        var totalLength1 = get_likedPost.length * getAll_Id.length;
        get_likedPost.forEach((data) => {
          getAll_Id.forEach((followId) => {
            if (followId == data._id) 
            {
              data.follow = 1;
            }
            count1 = count1 + 1;
            if(totalLength1 == count1)
            {
              if(requested.length)
              {
                setFollow2();
              }
              else
              {
                Response();
              }
            }
          })
        });
      }
      
      //setFollow2
      function setFollow2()
      {
        var count2 = 0;
        var totalLength2 = get_likedPost.length * requested.length;
        get_likedPost.forEach((data) => {
          requested.forEach((followId) => {
            if (followId == data._id) 
            {
              data.follow = 2;
            }
            count2 = count2 + 1;
            if(totalLength2 == count2)
            {
              Response();
            }
          })
        });
      }
              
      //Response
      function Response()
      {
        return res.json({
          success: true,
          result: get_likedPost,
          message: "Liked Users data"
        });
      }
    }
    else {
      return res.json({
        success: false,
        message: "No Likes",
      });
    }
   
  }
