const User = require("../../models/User/Users");
const Hashtag = require("../../models/User/hashtags");

exports.followUnfollowHashtag = async (req,res,next) => {

    try {
        let userId = req.body.userId;
        let hashId = req.body.hashId;
        let hashtag = req.body.hashtag;
        let type = req.body.type;
        if(type == 1)
        {
            const follow = await User.updateOne(
                {_id : userId},
                {
                   $push : {"followedHashtag" : {
                       _id : hashId,
                       hashtag : hashtag
                    } } 
                },{new:true}
            ).exec();
            const increaseFollowerCount = await Hashtag.updateOne(
                {_id : hashId},
                {$inc : {followerCount: 1}},
                {new : true}
            );
            if(increaseFollowerCount && follow){
                return res.json({
                    success:true,
                    message:'successfully following'
                })
            }
            else{
                return res.json({
                    success:false,
                    message:'error'
                })
            }
        }
        else if(type == 0)
        {
            const unfollow = await User.updateOne(
                {_id : userId},
                {
                   $pull : {"followedHashtag" : {
                       _id : hashId,
                       hashtag : hashtag
                    } } 
                },{new:true}
            ).exec();
            const decreaseFollowerCount = await Hashtag.updateOne(
                {_id : hashId},
                {$inc : {followerCount: -1}},
                {new : true}
            );
            if(decreaseFollowerCount && unfollow)
            {
                return res.json({
                    success:true,
                    message:'successfully unfollow',
                })
            }
            else
            {
                return res.json({
                    success:false,
                    message:'error'
                })
            }
        }
    } 
    catch (error)
    {
        return res.json({
            success:false,
            message:error
        })
    }
}