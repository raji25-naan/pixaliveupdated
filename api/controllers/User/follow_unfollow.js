const follow_unfollow = require("../../models/User/follow_unfollow");
const Users = require("../../models/User/Users");
var ObjectId = require("mongodb").ObjectId;

exports.createFollow = async(req,res,next) => {

    try
    {
      let followerId = req.body.user_id;
      let followingId = req.body.following_id;
        if(req.body.type == 1)
        {          
        const data = new follow_unfollow({
            followerId : followerId,
            followingId : followingId,
            status : 1,
            created_at : Date.now()
        });
        const saveData = await data.save();
        if(saveData)
        {
            //increase followingCount
            const updateFollowingCount = await Users.updateOne(
                {_id : followerId},
                {$inc : {followingCount : 1}},
                {new : true}
            );
            //increase followerCount
            const updateFollowerCount = await Users.updateOne(
                {_id : followingId},
                {$inc : {followersCount : 1}},
                {new : true}
            );
            if(updateFollowingCount && updateFollowerCount)
            {
                return res.json({
                    success:true,
                    message:"successfully followed"
                })
            }
        }
        }
        else if(req.body.type == 0)
        {
          const unfollow = await follow_unfollow.findOneAndDelete(
            {followerId : followerId,
            followingId : followingId});
          //decrease followingCount
          const updateFollowingCount = await Users.updateOne(
            {_id : followerId},
            {$inc : {followingCount : -1}},
            {new : true}
        );
          //decrease followerCount
          const updateFollowerCount = await Users.updateOne(
              {_id : followingId},
              {$inc : {followersCount : -1}},
              {new : true}
          );
          if(updateFollowingCount && updateFollowerCount)
          {
              return res.json({
                  success:true,
                  message:"successfully unfollowed"
              })
          }
        }
    }
    catch(error)
    {
        return res.json({
            success:false,
            message:"Error Occured!!!" + error,
        })
    }
}

exports.mutualFriendList = async(req,res,next)=> {
    
    try 
    {
        let user_id = req.query.uid;
        let id = req.query.id
        
        //getFollowingIdByUserid
        let getFollowingIdByUserid = await follow_unfollow.distinct('followingId',{followerId:user_id});
        //getFollowerIdByUserid
        let getFollowerIdByUserid = await follow_unfollow.distinct('followerId',{followingId:user_id});
        let a = getFollowingIdByUserid.concat(getFollowerIdByUserid);
        let totalIdByUserid = a.map(String);
        //getFollowingIdByid
        let getFollowingIdByid = await follow_unfollow.distinct('followingId',{followerId:id});
        // getFollowerIdByid
        let getFollowerIdByid = await follow_unfollow.distinct('followerId',{followingId:id});
        let b = getFollowingIdByid.concat(getFollowerIdByid);
        let totalIdByid = b.map(String);
        //filterData
        const totalUserIdArray = totalIdByUserid.filter(Set.prototype.has, new Set(totalIdByid));
        //getMutualFriendsData
        const getMutualFriendsData = await Users.find({_id : {$in : totalUserIdArray}}).exec();
        if(getMutualFriendsData)
        {
            return res.json({
                success:true,
                result : getMutualFriendsData, 
                message:"Mutual friends fetched successfully"
            }) 
        }
        else
        {
            return res.json({
                success:false,
                message:"Error Occured!!!" + error,
            })
        } 
    } 
    catch (error) {
        return res.json({
            success:false,
            message:"Error Occured!!!" + error,
        })
    }
}

exports.get_following = async (req, res, next) => {
    try 
    {
      const followerId = req.query.id;
      const uid = req.query.uid;
   
      const getFollowingid = await follow_unfollow.distinct("followingId", {
        followerId: followerId
      });
      const getFollowingUserData = await Users.find({
        _id: { $in: getFollowingid },
      });
      const data_follower = await follow_unfollow.distinct("followingId", {
        followerId: uid,
      });
      const data_following = await follow_unfollow.distinct("followerId", {
        followingId: uid,
      });
      const all_ID = data_follower.concat(data_following).map(String);
      const totalId = [...new Set(all_ID)];
   
      getFollowingUserData.forEach((data) => {
        totalId.forEach((followingUserId) => {
          if (followingUserId == data._id) {
             data.follow = 1;
          }
        });
      });
      return res.json({
        success: true,
        result: getFollowingUserData,
        message: "Successfully fetched following users!"
      });
    } 
    catch (error) {
      return res.json({
        success: false,
        message: "Error Occured!!!" + error,
      });
    }
  };

  exports.get_followers = async (req, res, next) => {
    try 
    {
      const followingId = req.query.id;
      const uid = req.query.uid;
   
      const getFollowerid = await follow_unfollow.distinct("followerId", {
        followingId: followingId
      });
      const getFollowerUserData = await Users.find({
        _id: { $in: getFollowerid },
      });
      const data_follower = await follow_unfollow.distinct("followingId", {
        followerId: uid,
      });
      const data_following = await follow_unfollow.distinct("followerId", {
        followingId: uid,
      });
      const all_ID = data_follower.concat(data_following).map(String);
      const totalId = [...new Set(all_ID)];
   
      getFollowerUserData.forEach((data) => {
        totalId.forEach((followerUserId) => {
          if (followerUserId == data._id) {
             data.follow = 1;
          }
        });
      });
      return res.json({
        success: true,
        result: getFollowerUserData,
        message: "Successfully fetched followers!"
      });
    } 
    catch (error) {
      return res.json({
        success: false,
        message: "Error Occured!!!" + error,
      });
    }
  };