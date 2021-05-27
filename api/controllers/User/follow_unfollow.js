const follow_unfollow = require("../../models/User/follow_unfollow");
const Users = require("../../models/User/Users");
const viewPost = require("../../models/User/viewPost");


exports.createFollow = async(req,res,next) => {

    try
    {
      let followerId = req.user_id;
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
        let user_id = req.user_id;
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
        const getMutualFriendsData = await Users.find({_id : {$in : totalUserIdArray},isActive: true}).exec();
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

  exports.suggestionFriendList = async(req,res,next)=> {

    try 
    {
      let {userId,lat,lng} = req.query;
      console.log(req.query);
      const getFollowerId = await follow_unfollow.distinct("followerId",{followingId:userId}).exec();
      const getFollowingId = await follow_unfollow.distinct("followingId",{followerId:userId}).exec();
      let all_ID = getFollowerId.concat(getFollowingId).map(String);
      let totalId = [...new Set(all_ID)];
      //getFriendsId
      const getfriendFollowerId = await follow_unfollow.distinct("followerId",{followingId:totalId}).exec();
      const getfriendFollowingId = await follow_unfollow.distinct("followingId",{followerId:totalId}).exec();
      let friends_ID = getfriendFollowerId.concat(getfriendFollowingId).map(String);
      let totalFriendsId = [...new Set(friends_ID)];
      //filterId
      let ids = new Set(totalId.map((id) => id));
      const filteredFriendoffriends = totalFriendsId.filter((id) => !ids.has(id));

      //getNearbyUserids
      const getNearbyUser = await Users.distinct("_id",{lat:lat,lng:lng}).exec();
      let getNearbyUserids = getNearbyUser.map(String);
      const filteredNearbyusers = getNearbyUserids.filter((id) => !ids.has(id));
      let joinedIds = filteredFriendoffriends.concat(filteredNearbyusers);
      //getViewedPost
      const getViewedPost = await viewPost.distinct("post_userID",{viewed_userId:userId}).exec();
      var filteredArray = getViewedPost.filter(
        (item) => (this[item] = ++this[item] || 1) === 3,
        {}
      );
      const filteredViewedpostIds = filteredArray.filter((id) => !ids.has(id));
      let combinedIds = joinedIds.concat(filteredViewedpostIds).map(String);
      let SuggestedIds = [...new Set(combinedIds)];
      console.log(SuggestedIds);
      let totalSuggestedIds = arrayRemove(SuggestedIds,userId);
      console.log(totalSuggestedIds);
      //getSuggestedList
      const getSuggestedList = await Users.find(
        {_id:totalSuggestedIds},
        {_id:1, username:1, email:1,avatar:1,phone:1,followersCount:1,followingCount:1}
      ).exec();
      return res.json({
        success : true,
        result : getSuggestedList
      })
    }
    catch (error) {
      return res.json({
        success: false,
        message: "Error Occured!!!" + error,
      });
    }
  }

  function arrayRemove(arr, id) {  
    return arr.filter(function(user_id){ 
        return user_id!= id; 
    });
}