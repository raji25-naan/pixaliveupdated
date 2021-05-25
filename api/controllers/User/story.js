const Story = require("../../models/User/story");
const moment = require("moment");
const follow_unfollow = require("../../models/User/follow_unfollow");
const momentTimeZone = require("moment-timezone");

exports.StoriesUpload = async(req,res,next)=>{

    try
    {
        let {url,userId} = req.body;
        const storyDisappearTime = moment().add(1, "d");
        const data = new Story({
        url:url,
        userId:userId,
        storyDisappearTime: storyDisappearTime.toISOString() ,
        created_at:Date.now()   
        })
        const saveData = await data.save();
        if(saveData)
        {
            return res.json({
                success: true,
                message: "Stories uploaded successfully"
            }); 
        }
        else
        {
            return res.json({
                success: false,
                message: "Error occured! " + error,
                });
        }
        
    }
    catch(error)
    {
        return res.json({
        success: false,
        message: "Error occured! " + error,
        });
    }
  
  }

exports.updateViewedStories = async(req,res,next) => {

    try
    {
        console.log(req.body);
        let userId = req.body.userId;
        let storyId = req.body.storyId;
        //findViewedUserId
        const findViewedUserId = await Story.findOne({
            _id : storyId,
            viewed_userId : userId
        }).exec();
        if(findViewedUserId)
        {
            return res.json({
                success: false,
                message: "user already viewed this story"
            });
        }
        else
        {
             //updateView
            const updateView = await Story.updateOne(
                {_id : storyId},
                {
                    $push : {viewed_userId : userId}
                },
                {new : true}
            ).exec();
            //incViewCount
            const incViewCount = await Story.updateOne(
                {_id : storyId},
                {
                    $inc : {viewedCount : 1}
                },
                {new : true}
            ).exec();
            if(updateView && incViewCount)
            {
                return res.json({
                    success: true,
                    message: "Story viewed successfully"
                });
            }
        }
    }
    catch(error)
    {
        return res.json({
        success: false,
        message: "Error occured! " + error,
        });
    }
}

exports.getStory = async(req,res,next) => {
  try
  {
    const user_id = req.query.user_id;
    const data_follower = await follow_unfollow.distinct("followingId",{
      followerId: user_id
    });
    const data_following = await follow_unfollow.distinct("followerId", {
      followingId: user_id
    });
    console.log(data_following)
    const all_ID = data_follower.concat(data_following).map(String);
    const totalId = [...new Set(all_ID)];
    console.log(totalId)
    if(totalId){
      const friendsStories = await Story.find({$and:[{userId:totalId},
        {storyDisappearTime:{$gt:moment(momentTimeZone().tz('Asia/kolkata')).toDate()}}]});
        console.log(friendsStories);
      if(friendsStories){
        return res.json({
          success: true,
          result: friendsStories,
          message: "Stories of your friends are shown!"
        });
      }
      else{
        return res.json({
        success: false,
        message: "Unable to show the stories of your friends!"
      });
      }
    }else{
      return res.json({
      success: false,
      message: "No data found"
    });
  }
  }
  catch (error)
  {
    return res.json({
    success: false,
    message: "Error Occured!!!" + error,
    });
  }
}