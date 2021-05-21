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

exports.create_hashtag = async (req,res,next) => {
    try {
        const {hashtag} = req.body;
 
        const createHashtag = new Hashtag({
            hashtag: hashtag,
            created_at: Date.now()
          });
 
        const saveData = await createHashtag.save();
        
        if(saveData){
            return res.json({
                success:true,
                message:"HashTag Added"
            })
        }
        else{
            return res.json({
                success:false,
                message:"Not added"
            })
        }
    } catch (error) {
        return res,json({
            success:false,
            message:"Error occured",error
        })
    }
}

exports.fetch_hashtag = async (req, res, next) => {
    try 
    {
      const search = req.body.search_hash;
      var reg = new RegExp(search);
      const all_hashtag = await Hashtag.find({ hashtag: reg });
      if (all_hashtag) {
        return res.json({
            success: true,
            hashtag: all_hashtag,
          });
        } else {
          return res.json({
            success: false,
            message: "No data found ",
          });
        }
    } 
    catch (error) {
      return res.json({
        success: false,
        message: "Error occured! " + error,
      });
    }
  };