const User = require("../../models/User/Users");
const Hashtag = require("../../models/User/hashtags");
const postSchema = require("../../models/User/Post");
const follow_unfollow = require("../../models/User/follow_unfollow");
const likeSchema = require("../../models/User/like");
const blocked = require("../../models/User/blocked");
const sleep = require('sleep-promise');
const { sendAllPost } = require("../../helpers/post");

exports.followUnfollowHashtag = async (req, res, next) => {

    let userId = req.user_id;
    let hashId = req.body.hashId;
    let hashtag = req.body.hashtag;
    let type = req.body.type;
    const check_hashtag = await User.distinct("followedHashtag", {
        _id: userId,
    });
    var arr = []
    check_hashtag.forEach(element => {
        arr.push(element.hashtag)
    });
    if (type == 1) {
        if (arr.indexOf(hashtag) == -1) {
            const follow = await User.updateOne(
                { _id: userId },
                {
                    $push: {
                        "followedHashtag": {
                            _id: hashId,
                            hashtag: hashtag
                        }
                    }
                }, { new: true }
            ).exec();
            const increaseFollowerCount = await Hashtag.updateOne(
                { _id: hashId },
                { $inc: { followerCount: 1 } },
                { new: true }
            );
            if (increaseFollowerCount && follow) {
                return res.json({
                    success: true,
                    message: 'successfully following'
                })
            }
            else {
                return res.json({
                    success: false,
                    message: 'error'
                })
            }
        }
        else {
            return res.json({
                success: false,
                message: 'Already Exist Hashtag'
            })
        }
    }
    else if (type == 0) {
        if (arr.indexOf(hashtag) !== -1) 
        {
            const unfollow = await User.updateOne(
                { _id: userId },
                {
                    $pull: {
                        "followedHashtag": {
                            _id: hashId,
                            hashtag: hashtag
                        }
                    }
                }, { new: true }
            ).exec();
            const decreaseFollowerCount = await Hashtag.updateOne(
                { _id: hashId },
                { $inc: { followerCount: -1 } },
                { new: true }
            );
            if (decreaseFollowerCount && unfollow)
            {
                return res.json({
                    success: true,
                    message: 'successfully unfollow',
                })
            }
            else {
                return res.json({
                    success: false,
                    message: 'error'
                })
            }
        }
        else
        {
            return res.json({
                success: false,
                message: 'Not an existing'
            }) 
        }
    }
}

exports.create_hashtag = async (req, res, next) => {
    const { hashtag } = req.body;
    const createHashtag = new Hashtag({
        hashtag: hashtag,
        created_at: Date.now()
    });

    const saveData = await createHashtag.save();

    if (saveData) {
        return res.json({
            success: true,
            message: "HashTag Added"
        })
    }
    else {
        return res.json({
            success: false,
            message: "Not added"
        })
    }
}

//fetch_hashtag
exports.fetch_hashtag = async (req, res, next) => {
    const user_id = req.user_id;
    const search = req.body.search_hash;
    // blocked User
    let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: user_id }).exec();
    let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: user_id }).exec();
    let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);

    const get_data = await Hashtag.find({}).exec();
    const getHashtags = get_data.filter(data => new RegExp(search, "ig").test(data.hashtag)).sort((a, b) => {
        let re = new RegExp("^" + search, "i")
        return re.test(a.hashtag) ? re.test(b.hashtag) ? a.hashtag.localeCompare(b.hashtag) : -1 : 1
    });
    if (getHashtags.length > 0) 
    {
        //userFollowedHashtagList
        let userFollowedHashtagList = await User.distinct(
            "followedHashtag._id",
            { _id: user_id }
        ).exec();
        userFollowedHashtagList = userFollowedHashtagList.map(String);
        var followedHashtagId = [...new Set(userFollowedHashtagList)];

        var counter1 = 0;
        getHashtags.forEach(async (data) => {
            let postCount = await postSchema.find({
                 hashtag: data.hashtag,
                 user_id: { $nin: totalBlockedUser },
                 isActive: true,
                 isDeleted: false,
                 privacyType: { $nin: ["onlyMe", "private"] } }).exec();
            data.posts = postCount.length;
            counter1 = counter1 + 1;
            if(getHashtags.length == counter1)
            {
                if(followedHashtagId.length)
                {
                    setFollow1();
                }
                else
                {
                    sendResponse();
                }
            }
        })

        function setFollow1()
        {
            var counter2 = 0;
            var totalLength = getHashtags.length * followedHashtagId.length;
            getHashtags.forEach((data) => {
                followedHashtagId.forEach((hashId) => {
                    if (hashId == data._id) {
                        data.follow = 1;
                    }
                    counter2 = counter2 + 1;
                    if(totalLength == counter2)
                    {
                        sendResponse();
                    }
                });
            });
        }

        //Response
        function sendResponse()
        {
            return res.json({
                success: true,
                result: getHashtags
            });
        }

    } else {
        return res.json({
            success: false,
            message: "hashtag not found ",
        });
    }
};

// get related video using hashtag
exports.getvideo_hashtag = async (req, res, next) => {

    let hashtagList = [];
    hashtagList = req.body.hashtag;
    const current_user_id = req.user_id;
    // blocked User
    let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
    let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: current_user_id }).exec();
    let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
    //follower_data
    const follower_data = await follow_unfollow.distinct("followingId", {
        followerId: current_user_id,
        status: 1
    }).exec();
    let blockedAndFollowing = totalBlockedUser.concat(follower_data);

    //post_hashtagWithFollowing
    const post_hashtagWithFollowing = await postSchema.find({
        hashtag: { $in: hashtagList },
        user_id: { $in: follower_data, $nin: totalBlockedUser },
        isDeleted: false,
        isActive: true,
        post_type: 1,
        privacyType: { $nin: ["onlyMe"] }
    }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
    //post_hashtagWithoutFollowing
    const post_hashtagWithoutFollowing = await postSchema.find({
        hashtag: { $in: hashtagList },
        user_id: { $nin: blockedAndFollowing },
        isDeleted: false,
        isActive: true,
        post_type: 1,
        privacyType: { $nin: ["onlyMe", "private"] }
    }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();

    let getvideo_post = post_hashtagWithFollowing.concat(post_hashtagWithoutFollowing);

    if (getvideo_post.length) {
        var change_string = follower_data.map(String);
        var getAll_Id = [...new Set(change_string)];
        //request_data_main
        const request_data_main = await follow_unfollow.distinct("followingId", {
            followerId: current_user_id,
            status: 0
        });
        var requestData = request_data_main.map(String);
        var requested = [...new Set(requestData)];
        //getUser_like
        const getUser_like = await likeSchema.distinct("post_id", {
            user_id: current_user_id,
            isLike: 1,
        }).exec();
        const liked_Ids = getUser_like.map(String);
        //follow1
        getvideo_post.forEach((data) => {
            getAll_Id.forEach((followId) => {
                if (followId == data.user_id._id) {
                    data.user_id.follow = 1;
                }
            })
        });
        //follow2
        getvideo_post.forEach((data) => {
            requested.forEach((followId) => {
                if (followId == data.user_id._id) {
                    data.user_id.follow = 2;
                }
            })
        });
        //isLiked
        getvideo_post.forEach((post) => {
            liked_Ids.forEach((id) => {
                if (id == post._id) {
                    post.isLiked = 1;
                }
            });
        });

        sleep(2000).then(function () {
            sendAllPost(getvideo_post,current_user_id, res)
        });
    } else {
        return res.json({
            success: false,
            message: "No post found!",
        });
    }
}

//getPostByhashtag
exports.getPostByhashtag = async (req, res, next) => {

    // var arr = [];
    let hashtag = req.body.hashtag;
    const current_user_id = req.user_id;
    // blocked User
    let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
    let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: current_user_id }).exec();
    let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
    //follower_data
    const follower_data = await follow_unfollow.distinct("followingId", {
        followerId: current_user_id,
        status: 1
    }).exec();
    // let blockedAndFollowing = totalBlockedUser.concat(follower_data);

    //post_hashtagWithFollowing
    // const post_hashtagWithFollowing = await postSchema.find({
    //     hashtag: { $in: hashtag },
    //     user_id: { $in: follower_data, $nin: totalBlockedUser },
    //     isDeleted: false,
    //     isActive: true,
    //     privacyType: { $nin: ["onlyMe"] }
    // }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
    //post_hashtagWithoutFollowing
    const getAll_post = await postSchema.find({
        hashtag: { $in: hashtag },
        user_id: { $nin: totalBlockedUser },
        isDeleted: false,
        isActive: true,
        privacyType: { $nin: ["onlyMe", "private"] }
    }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();

    // let getAll_post = post_hashtagWithFollowing.concat(post_hashtagWithoutFollowing);
    
    if (getAll_post.length)
    {
        var change_string = follower_data.map(String);
        var getAll_Id = [...new Set(change_string)];
        //request_data_main
        const request_data_main = await follow_unfollow.distinct("followingId", {
            followerId: current_user_id,
            status: 0
        });
        var requestData = request_data_main.map(String);
        var requested = [...new Set(requestData)];
        //getUser_like
        const getUser_like = await likeSchema.distinct("post_id", {
            user_id: current_user_id,
            isLike: 1,
        }).exec();
        const liked_Ids = getUser_like.map(String);
        //follow1
        getAll_post.forEach((data) => {
            getAll_Id.forEach((followId) => {
                if (followId == data.user_id._id) {
                    data.user_id.follow = 1;
                }
            })
        });
        //follow2
        getAll_post.forEach((data) => {
            requested.forEach((followId) => {
                if (followId == data.user_id._id) {
                    data.user_id.follow = 2;
                }
            })
        });
        //isLiked
        getAll_post.forEach((post) => {
            liked_Ids.forEach((id) => {
                if (id == post._id) {
                    post.isLiked = 1;
                }
            });
        });

        sleep(2000).then(function () {
            sendAllPost(getAll_post,current_user_id, res)
          });
    } 
    else {
        return res.json({
            success: false,
            message: "No post found!",
        });
    }
}
