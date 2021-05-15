const commentSchema = require("../../models/User/Comment");
const postSchema = require("../../models/User/Post");
const notificationSchema = require("../../models/User/Notification");

// ************create comment*******************

exports.add_comment = async (req, res, next) => {
  try {
    //    get id and comment
    var { user_id, comment, post_id } = req.body;
    if (post_id == undefined && user_id == undefined) {
      return res.json({
        success: false,
        message: "Invalid post id",
      });
    }

    // create document for user in db
    const updateComment = new commentSchema({
      post_id: post_id,
      user_id: user_id,
      comment: comment,
      created_at: new Date(),
    });
    const saveData = await updateComment.save();

    if (saveData) {
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
      } else {
      }
    } else {
      return res.json({
        success: true,
        message: "Comment added",
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
    const getcomment = await commentSchema.find({ post_id: post_id });
    if (getcomment) {
      res.json({
        success: true,
        result: getcomment,
        message: "Comment fetched successfully",
      });
    } else {
      res.json({
        success: false,
        message: "error occured in getting comment",
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
    const comment = await commentSchema.findOneAndDelete({ _id: comment_id });

    if (comment) {
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
