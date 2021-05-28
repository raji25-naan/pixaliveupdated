const commentSchema = require("../../models/User/Comment");
const postSchema = require("../../models/User/Post");
const notificationSchema = require("../../models/User/Notification");
const Users = require("../../models/User/Users");

// ************create comment*******************

exports.add_comment = async (req, res, next) => {
  try {
    //    get id and comment
    let user_id = req.user_id;
    var {comment, post_id } = req.body;

    // create document for user in db
    const updateComment = new commentSchema({
      post_id: post_id,
      user_id: user_id,
      comment: comment,
      created_at: new Date(),
    });
    const saveData = await updateComment.save();
    const updatecommentCount = await postSchema.updateOne(
      {_id : post_id},
      {$inc : {commentCount :1}},
      {new :true}
    );
    if (updatecommentCount) {
      const userPost = await postSchema.findOne({ _id: post_id });
      if (userPost) {
        if (user_id != userPost.user_id) {
          const updateNotification = new notificationSchema({
            sender_id: user_id,
            receiver_id: userPost.user_id,
            post_id: post_id,
            type: 1,
            seen: 0,
          });
          const saveNotificationData = await updateNotification.save();
          if (saveNotificationData) {
            // sendNotification(user_id, userPost.user_id, 1);
            return res.json({
              success: true,
              message: "Comment added",
            });
          }
        } else {
          return res.json({
            success: true,
            message: "Comment added",
          });
        }
      } 
    } else {
      return res.json({
        success: true,
        message: "Error Occured"+error
      });
    }
  } catch (error) {
    //  if error through error message
    return res.json({
      success: false,
      message: "Error adding Comment" + error,
    });
  }
};

// get comment using post-id

exports.getPost_comments = async (req, res, next) => {
  try {
    const post_id = req.query.post_id;
    let inactiveUsers = await Users.distinct("_id",{isActive : false}).exec();
    console.log(inactiveUsers);
    const getcomment = await commentSchema.find({ post_id: post_id,user_id:{$nin : inactiveUsers}}).populate("user_id","username first_name last_name avatar follow").exec();
    console.log(getcomment);
    if (getcomment.length>0) {
      return res.json({
        success: true,
        comments: getcomment,
        message: "Comment fetched successfully"
      });
    } else {
      return res.json({
        success: false,
        message: "No comments"
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: "error occured " + error,
    });
  }
};

// Delete comment using post_id

exports.delete_comment = async (req, res, next) => {
  try {
    let { comment_id} = req.body;
    // pull out comment
    const getComment = await commentSchema.findOne({_id:comment_id});
    const comment = await commentSchema.findOneAndDelete({ _id: comment_id });
    const updatecommentCount = await postSchema.updateOne(
      {_id : getComment.post_id},
      {$inc : {commentCount : -1}},
      {new :true}
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
  } catch (error) {
    res.json({
      success: false,
      message: "error occured " + error,
    });
  }
};

function sendNotification(sender, receiver, type) {
  var message;
  var title;

  if (type == 0) {
    title = "New like";
    message = " liked your post";
  } else if (type == 1) {
    title = "New comment";
    message = " commented on your post";
  } else {
    title = "New follow";
    message = " started following you";
  }
}
