const follow_unfollow = require("../../models/User/follow_unfollow");
const pointSchema = require("../../models/User/points");
const Post = require("../../models/User/Post");
const sleep = require('sleep-promise');


module.exports.increasePost_Point = async function(userId){

    let postPoint = await pointSchema.updateOne(
        {_id : userId},
        {
            $inc : {post_Points : 50}
        },
        {new : true}
    ).exec();
    if(postPoint)
    {
        updateTotalPoint(userId) 
    }
}

module.exports.increaseReloop_Point = async function(userId){

    let reloopPoint = await pointSchema.updateOne(
        {_id : userId},
        {
            $inc : {reloop_Points : 10}
        },
        {new : true}
    ).exec();
    if(reloopPoint)
    {
        updateTotalPoint(userId) 
    }

}

module.exports.increaseShare_Point = async (req,res,next) => {

    const post = await Post.findOne({_id: req.body.post_id}).exec();

    let sharePoint = await pointSchema.updateOne(
        {_id : post.user_id},
        {
            $inc : {share_Points : 10}
        },
        {new : true}
    ).exec();
    if(sharePoint)
    {
        let userId = post.user_id;
        updateTotalPoint(userId) 
    }

}

//updateTotalPoint
async function updateTotalPoint(userId){

    const getPoints = await pointSchema.findOne({_id: userId}).exec();
    let totalPoints = getPoints.post_Points + getPoints.reloop_Points + getPoints.share_Points;
    await pointSchema.updateOne(
        {_id : userId},
        {
          $set : {total_Points : totalPoints}
        },
        {new : true}
    ).exec();

}

module.exports.trendingPeople = async (req,res,next)=>{
   
        let user_id = req.user_id;
        console.log(req.query.suggestion);
        if(req.query.suggestion == 'true')
        {
            let trendingPeopleIds = await pointSchema.distinct("_id",{}).exec();
            trendingPeopleIds = trendingPeopleIds.map(String);
            //following_data
            const following_data = await follow_unfollow.distinct("followingId", {
                followerId: user_id,status: 1
            }).exec();
            var totalId = following_data.map(String);
            var friendlist = [...new Set(totalId)];
            //request_data
            const request_data = await follow_unfollow.distinct("followingId", {
                followerId: user_id,status: 0
            }).exec();
            var request_string = request_data.map(String);
            var requested = [...new Set(request_string)];
            var friendAndRequest = friendlist.concat(requested);
            //removeFollowingRequested
            let ids = new Set(friendAndRequest.map((id) => id));
            const suggestedfriends = trendingPeopleIds.filter((id) => !ids.has(id));
            //getTrendingPeople
            const getTrendingPeople = await pointSchema.find({_id:{$in: suggestedfriends}}).populate("_id","name username avatar private follow").sort({total_Points: -1}).limit(1000).exec();
            if(getTrendingPeople)
            {
                return res.json({
                    success: true,
                    trendingPeople: getTrendingPeople,
                    message:"Successfully fetched"
                    });
            }
               
        }
        else
        {
            const getTrendingPeople = await pointSchema.find({}).populate("_id","name username avatar private follow").sort({total_Points: -1}).limit(1000).exec();
            if(getTrendingPeople.length)
            {            
                //following_data
                const following_data = await follow_unfollow.distinct("followingId", {
                    followerId: user_id,status: 1
                }).exec();
                var totalId = following_data.map(String);
                var friendlist = [...new Set(totalId)];
                //request_data
                const request_data = await follow_unfollow.distinct("followingId", {
                    followerId: user_id,status: 0
                }).exec();
                var request_string = request_data.map(String);
                var requested = [...new Set(request_string)];
                //follow1
                getTrendingPeople.forEach((data)=>{
                    friendlist.forEach((id)=>{
                        if(id == data._id._id)
                        {
                            data._id.follow = 1
                        }
                    });
                });
                //follow2
                getTrendingPeople.forEach((data)=>{
                    requested.forEach((id)=>{
                        if(id == data._id._id)
                        {
                            data._id.follow = 2
                        }
                    });
                });

                sleep(2000).then(function () {
                    return res.json({
                    success: true,
                    trendingPeople: getTrendingPeople,
                    message:"Successfully fetched"
                    });
                });
            }
            else
            {
                return res.json({
                    success:true,
                    trendingPeople: getTrendingPeople,
                    message:"No data found"
                })
            }
        }
}
