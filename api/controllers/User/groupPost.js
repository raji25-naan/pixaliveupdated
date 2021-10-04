const group = require("../../models/User/group");
const Post = require("../../models/User/Post");
const likeSchema = require("../../models/User/like");

//getGroupPost
exports.getGroupPost = async(req,res,next)=>{

    let user_id = req.user_id;
    let group_id = req.query.group_id;

    //blockedUserIds
    let blockedUserIds = await group.distinct("blockedMembersId._id",{_id: group_id}).exec();
    //getPost
    let getPost = await Post.find({group_id: group_id,user_id:{$nin:blockedUserIds},
                                   isActive: true,
                                   isDeleted: false,
                                   verified: true}).populate("user_id", "username avatar name ").sort({created_at:-1}).exec();

    if(getPost.length)
    {
        let get_like = await likeSchema.distinct("post_id", {
            user_id: user_id,
            isLike: 1,
          }).exec();
        let likedIds = get_like.map(String);
        if(likedIds.length)
        {
            setisLiked();
        }
        else
        {
            sendtoResponse();
        }
        
        //setisLiked
        function setisLiked()
        {
            var count = 0;
            var totalLength = getPost.length * likedIds.length;
            getPost.forEach((post) => {
                likedIds.forEach((id) => {
                if (id == post._id) 
                {
                    post.isLiked = 1;
                }
                count = count + 1;
                if(totalLength == count)
                {
                    sendtoResponse();
                }
                });
            });
        }

        //sendtoResponse
        function sendtoResponse()
        {
            return res.json({
                success: true,
                result: getPost,
                message: "Successfully fetched"
            })
        }
    }
    else
    {
        return res.json({
            success: true,
            result: [],
            message: "No post found"
        })
    }

}

//getGroupPendingPost
exports.getGroupPendingPost = async(req,res,next)=>{

    let group_id = req.query.group_id;

    const getPost = await Post.find({group_id: group_id,
                                    isActive: true,
                                    isDeleted: false,
                                    verified: false
                                }).populate("user_id", "username avatar name ").exec();

    if(getPost.length)
    {
        return res.json({
            success: true,
            result: getPost,
            message: "Successfully fetched"
        })
    }
    else
    {
        return res.json({
            success: true,
            result: [],
            message: "No post found"
        })
    }

}

//Accept_RejectGroupPost
exports.Accept_RejectGroupPost = async (req,res,next)=>{

    let {type,post_id,group_id} = req.body;

    const findLoop = await Post.findOne({_id: post_id});

    if(type == 1)
    {
        if(findLoop.verified == false)
        {
            //accept
            const accept = await Post.updateOne(
                {_id: post_id},
                {
                    $set:{verified: true}
                },
                {new: true}
            );

            //decpendingLoopsCount
            const decpendingLoopsCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        pendingLoops: -1
                    }
                },
                {new: true}
              );

            //post_updatedOnTime
            const post_updatedOnTime = await group.findOneAndUpdate(
                { _id: group_id },
                {
                $set: {
                    post_updatedOn: Date.now()
                    }
                },
                { new: true }
            ).exec();

            if(accept && decpendingLoopsCount && post_updatedOnTime)
            {
                return res.json({
                    success: true,
                    message: "Successfully Accepted"
                })
            }
            else if(error)
            {
                return res.json({
                    success: false,
                    message: "Error occured"+error
                })
            }
        }     
        else
        {
            return res.json({
                success: false,
                message: "Already verified this loop"
            })
        }  
    }
    else if(type == 0)
    {
        if(findLoop.verified == false && findLoop.isDeleted == false)
        {
            //reject
            const reject = await Post.updateOne(
                {_id: post_id},
                {
                    $set:{isDeleted: true}
                },
                {new: true}
            );
                
            //decpendingLoopsCount
            const decpendingLoopsCount = await group.findOneAndUpdate(
                {_id: group_id},
                {
                    $inc:{
                        pendingLoops: -1
                    }
                },
                {new: true}
              );

            if(reject && decpendingLoopsCount)
            {
                return res.json({
                    success: true,
                    message: "Successfully Rejected"
                })
            }
            else if(error)
            {
                return res.json({
                    success: false,
                    message: "Error occured"+error
                })
            }
        }
        else
        {
            return res.json({
                success: false,
                message: "May be verified or deleted this loop"
            })
        }  
        

        
    }

}