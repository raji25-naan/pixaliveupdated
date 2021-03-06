const commentSchema = require("../../models/User/Comment");
const postSchema = require("../../models/User/Post");
const notificationSchema = require("../../models/User/Notification");
const Users = require("../../models/User/Users");
const { sendNotification } = require("../../helpers/notification");
const sleep = require('sleep-promise');
const replyCommentLike = require("../../models/User/replyCommentLike");
const { checkNotification } = require("../../helpers/post");

// ************create comment*******************

exports.add_comment = async (req, res, next) => {

    let user_id = req.body.user_id;
    var { comment, post_id } = req.body;

    let updateComment;
    let saveData;
    if(req.body.group_id)
    {
      updateComment = new commentSchema({
        post_id: post_id,
        user_id: user_id,
        group_id: req.body.group_id,
        comment: comment,
        created_at: new Date(),
      });
      saveData = await updateComment.save();
    }
    else
    {
      updateComment = new commentSchema({
        post_id: post_id,
        user_id: user_id,
        comment: comment,
        created_at: new Date()
      });
      saveData = await updateComment.save();
    }
    if(saveData)
    {
      const updatecommentCount = await postSchema.updateOne(
        { _id: post_id },
        { $inc: { commentCount: 1 } },
        { new: true }
      );
    
      const userPost = await postSchema.findOne({ _id: post_id });
      if (user_id != userPost.user_id) 
      {
        const senderDetails1 = await commentSchema.find({post_id:post_id},{_id:0,user_id:1}).sort({created_at:-1})
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
          receiver_id: userPost.user_id,
          post_id: post_id,
          type: 1,
          seen: false
        });
        const saveNotificationData = await updateNotification.save();
        if (saveNotificationData) 
        {
          var userId = userPost.user_id;
          var checkNotify = await checkNotification(userId);
          if(checkNotify == true)
          {
            sendNotification(totalId, userPost.user_id, 1);
          }
          return res.json({
            success: true,
            message: "Comment added",
          });
        }
      }
    } 
    else 
    {
      return res.json({
        success: true,
        message: "Error Occured" + error
      });
    }
};

//editComment
exports.editComment = async(req,res,next)=>{

  let {comment_id,comment} = req.body;
  const updateComment = await commentSchema.findByIdAndUpdate({_id:comment_id},
    {
    $set:{
      comment:comment
    },
  },{ new: true });
  if(updateComment)
  {
    return res.json({
      success:true,
      message:"Comment edited successfully!"
    })
  }
  else
  {
    return res.json({
      success:false,
      message:"Error"
    })
  }
 
}

// get comment using post-id

exports.getPost_comments = async (req, res, next) => {
    const user_id = req.user_id;
    const post_id = req.query.post_id;
    let inactiveUsers = await Users.distinct("_id", { isActive: false }).exec();
    const getcomment = await commentSchema.find({ post_id: post_id, user_id: { $nin: inactiveUsers } }).populate("user_id", "username name avatar private follow")
    .populate("Reply.user_id", "username name avatar private follow").exec();
    if (getcomment.length) 
    {
      //getReplyCommentLikes
      const getReplyCommentLikes = await replyCommentLike.distinct("replyComment_id",{likedUser_id: user_id}).exec();
      const totalReplyCommentLikeIds = getReplyCommentLikes.map(String);

      //isLiked 1
      getcomment.forEach((data)=>{
        data.LikedUser.forEach((like)=>{
          if(like._id == user_id)
          {
            data.isLiked = 1
          }
        })
      })
      //isLikedReply 1
      getcomment.forEach((data)=>{
        data.Reply.forEach((likedData)=>{
          totalReplyCommentLikeIds.forEach((likedCommentId)=>{
            if(likedData._id == likedCommentId)
            {
              likedData.isLikedReply = 1
            }
          })
        })
      })
      sleep(2000).then(function () {
        return res.json({
          success: true,
          comments: getcomment,
          message: "Comment fetched successfully"
        });
      });
    } else {
      return res.json({
        success: true,
        comments: getcomment,
        message: "No comments"
      });
    }
};

// Delete comment using post_id

exports.delete_comment = async (req, res, next) => {
    let { comment_id } = req.body;
    // pull out comment
    const getComment = await commentSchema.findOne({ _id: comment_id });
    const comment = await commentSchema.findOneAndDelete({ _id: comment_id });
    const updatecommentCount = await postSchema.updateOne(
      { _id: getComment.post_id },
      { $inc: { commentCount: -1 } },
      { new: true }
    );
    if (comment && updatecommentCount) {
      res.json({
        success: true,
        message: "Delete comment successfully",
      });
    } else {
      res.json({
        success: false,
        message: "Error occured in delete comment",
      });
    }
};

//addlikeTocomment
exports.addLiketoComment = async (req, res, next) => {
    const { user_id,comment_id } = req.body;
    //checkCommentLike
    const checkCommentLike = await commentSchema.findOne({_id: comment_id,LikedUser:{ _id: user_id }}).exec();
    console.log(checkCommentLike);
    if(req.body.type == 1)
    {
      if(checkCommentLike !== null)
      {
        return res.json({
          success: false,
          message: 'Already Existing...check!'
        })
      }
      else
      {
        const addlike = await commentSchema.findByIdAndUpdate(
          {_id: comment_id },
          {
           $push: {
               "LikedUser": {
                   _id: user_id
                  }
           }
           }, { new: true }).exec();
           //increaseLikeCount
           const increaseLikeCount = await commentSchema.updateOne(
            { _id: comment_id },
            { $inc: { likeCount: 1 } },
            { new: true });
            if (increaseLikeCount && addlike) 
            {
              return res.json({
                  success: true,
                  message: 'successfully Liked the Comment'
              })
            }
            else {
              return res.json({
                  success: false,
                  message: 'error in like comment'
              })
            }
        }  
    } 
    else if(req.body.type == 0) 
    {
      if(checkCommentLike !== null)
      {
        const unlike = await commentSchema.findByIdAndUpdate(
          {_id : comment_id },
          {
            $pull: {
                "LikedUser": {
                    _id: user_id,
                   }
            }
        }, { new: true });
        const decreaseLikeCount = await commentSchema.updateOne(
          { _id: comment_id },
          { $inc: { likeCount: -1 } },
          { new: true }
        );
        if(unlike && decreaseLikeCount) {
          return res.json({
            success : true,
            message : "Unlike successfully"
          })
        } else {
          return res.json({
            success :false,
            message : "Error occured in unlike"
          })
        }
      }
      else
      {
        return res.json({
          success: false,
          message: 'Not an Existing...check!'
        })
      }
      
    }
}

//addreplyComment
exports.addreplyComment = async (req, res, next) => {
  const { user_id,comment_id,replyComment } = req.body;
  //addReply
  const addReply = await commentSchema.findByIdAndUpdate(
                   {_id: comment_id },
                   {
                    $push: {
                        "Reply": {
                          user_id: user_id,
                          replyComment: replyComment,
                          created_at: Date.now()
                           }
                    }
                  }, { new: true }).exec();
  if(addReply) 
  {
    return res.json({
      success : true,
      message : "Successfully added reply comment.."
    })
  }
  else
  {
    return res.json({
      success :false,
      message : "Error occured in reply comment"
    })
  } 
}

//addLiketoReplyComment
exports.addLiketoReplyComment = async (req, res, next) => {
  const {user_id,replyComment_id } = req.body;
  //checkCommentLike
  const checkCommentLike = await replyCommentLike.findOne({replyComment_id:replyComment_id,likedUser_id:user_id}).exec();

  if(req.body.type == 1)
  {
    if(checkCommentLike !== null)
    {
      return res.json({
        success: false,
        message: 'Already Existing...check!'
      })
    }
    else
    {
        const addLike = new replyCommentLike({
          replyComment_id: replyComment_id,
          likedUser_id: user_id
        });
        const saveLike = await addLike.save();
        
         //increaseLikeCount
         const increaseLikeCount = await commentSchema.findOneAndUpdate(
          {"Reply._id":replyComment_id},
          { $inc: {"Reply.$.ReplyLikeCount":1}},
          {new: true}).exec();
          if(saveLike && increaseLikeCount) 
          {
            return res.json({
                success: true,
                message: 'successfully Liked..'
            })
          }
          else {
            return res.json({
                success: false,
                message: 'error in like comment'+error
            })
          }
      }  
  } 
  else if(req.body.type == 0) 
  {
    if(checkCommentLike !== null)
    {
      const unlike = await replyCommentLike.findOneAndDelete({
        replyComment_id: replyComment_id,
          likedUser_id: user_id
      });
      //decreaseLikeCount  
      const decreaseLikeCount = await commentSchema.findOneAndUpdate(
        {"Reply._id":replyComment_id},
        { $inc: {"Reply.$.ReplyLikeCount":-1}},
        {new: true}).exec();      
      if(unlike && decreaseLikeCount) {
        return res.json({
          success : true,
          message : "Unlike successfully"
        })
      } else {
        return res.json({
          success :false,
          message : "Error occured in unlike"
        })
      }
    }
    else
    {
      return res.json({
        success: false,
        message: 'Not an Existing...check!'
      })
    }
    
  }
}

