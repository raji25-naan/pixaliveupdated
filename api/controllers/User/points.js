const follow_unfollow = require("../../models/User/follow_unfollow");
const pointSchema = require("../../models/User/points");
const Post = require("../../models/User/Post");
const Users = require("../../models/User/Users");
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

module.exports.decreasePost_Point = async function(userId){

    let postPoint = await pointSchema.updateOne(
        {_id : userId},
        {
            $inc : {post_Points : -50}
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
        const offset = req.query.offset;
        var row = 100;

        let inactiveUsers = await Users.distinct("_id",{isActive: false}).exec();        
        if(req.query.suggestion == 'true')
        {
            //following_data
            const following_data = await follow_unfollow.distinct("followingId", {
                followerId: user_id,status: 1
            }).exec();
            //request_data
            const request_data = await follow_unfollow.distinct("followingId", {
                followerId: user_id,status: 0
            }).exec();
            var friendAndRequest = following_data.concat(request_data,inactiveUsers);
            
            //getTrendingPeople
            const getTrendingPeople = await(await pointSchema.find({_id:{$nin: friendAndRequest}}).populate("_id","name username avatar private followersCount follow").sort({total_Points: -1})).splice(offset == undefined ? 0 : offset, row);
            if(getTrendingPeople)
            {
                return res.json({
                    success: true,
                    trendingPeople: getTrendingPeople,
                    message:"Successfully fetched"
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
        else
        {
            const trendingPeopleList = await(await pointSchema.find({_id:{$nin: inactiveUsers}}).populate("_id","name username avatar private followersCount follow").sort({total_Points: -1})).splice(offset == undefined ? 0 : offset, row);
            let getTrendingPeople;
            if(req.query.search)
            {
                let search = req.query.search;
                getTrendingPeople = trendingPeopleList.filter(data => new RegExp(search, "ig").test(data._id.name)).sort((a, b) => {
                                    let re = new RegExp("^" + search, "i")
                                    return re.test(a._id.name) ? re.test(b._id.name) ? a._id.name.localeCompare(b._id.name) : -1 : 1
                                    });
            }
            else
            {
                getTrendingPeople =  trendingPeopleList;
            }
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

                //check
                if(friendlist.length)
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
                    var totalLength1 = getTrendingPeople.length * friendlist.length;
                    getTrendingPeople.forEach((data)=>{
                        friendlist.forEach((id)=>{
                            if(id == data._id._id)
                            {
                                data._id.follow = 1
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
                        });
                    });
                }

                //setFollow2
                function setFollow2()
                {
                    var count2 = 0;
                    var totalLength2 = getTrendingPeople.length * requested.length;
                    getTrendingPeople.forEach((data)=>{
                        requested.forEach((id)=>{
                            if(id == data._id._id)
                            {
                                data._id.follow = 2
                            }
                            count2 = count2 + 1;
                            if(totalLength2 == count2)
                            {
                                Response();
                            }
                        });
                    });
                
                }                

                //Response
                function Response()
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
                return res.json({
                    success:true,
                    trendingPeople: getTrendingPeople,
                    message:"No data found"
                })
            }
        }
}
