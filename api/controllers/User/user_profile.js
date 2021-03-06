
const Post = require('../../models/User/Post');
const User = require('../../models/User/Users');
const follow_unfollow = require("../../models/User/follow_unfollow");
const likeSchema = require("../../models/User/like");
const TagPost = require('../../models/User/userTagpost');
const sleep = require('sleep-promise');
const blocked = require("../../models/User/blocked");
const hidePostSchema = require("../../models/User/HidePost");
const { sendAllPost } = require('../../helpers/post');
const poll_voted = require("../../models/User/poll_voted");

// All post of the user except reloop
exports.user_allPost = async (req, res, next) => {
        const current_user_id = req.user_id;
        const getpost_user_id = req.query.user_id;
        const offset = req.query.offset;
        var row = 50;
        //totalBlockedUser
        let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
        let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: current_user_id }).exec();
        let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
        //getHidePost
        let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: current_user_id }).exec();
        var get_post;

        if ((current_user_id).toString() == (getpost_user_id).toString()) 
        {
            get_post = await(await Post.find({
                _id: {$nin: getHidePost},
                user_id: getpost_user_id,
                isActive: true,
                isDeleted: false,
                groupPost: false
            }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 })).splice(offset == undefined ? 0 : offset, row);
        }
        else
        {
            const follower_data = await follow_unfollow.findOne({ followerId: current_user_id, followingId: getpost_user_id, status: 1 });
            if (follower_data) {
                get_post = await(await Post.find({
                    _id: {$nin: getHidePost},
                    user_id: { $in: getpost_user_id, $nin: totalBlockedUser },
                    privacyType: { $nin: "onlyMe" },
                    isActive: true,
                    isDeleted: false,
                    groupPost: false
                }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 })).splice(offset == undefined ? 0 : offset, row);
            }
            else {
                get_post = await(await Post.find({
                    _id: {$nin: getHidePost},
                    user_id: { $in: getpost_user_id, $nin: totalBlockedUser },
                    privacyType: { $nin: ["onlyMe", "private"] },
                    isActive: true, 
                    isDeleted: false,    
                    groupPost: false
                }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 })).splice(offset == undefined ? 0 : offset, row);
            }

        }
        if (get_post.length) 
        {
            const arr_post = []
            get_post.forEach(post => {
                if (post.reloopPostId == undefined) {
                    arr_post.push(post)
                }
            })
            if (arr_post.length)
            {
                //follower_data_main
                const follower_data_main = await follow_unfollow.distinct("followingId", {
                    followerId: current_user_id,
                    status: 1
                });
                var change_string = follower_data_main.map(String);
                var getAll_Id = [...new Set(change_string)];
                //request_data_main
                const request_data_main = await follow_unfollow.distinct("followingId", {
                    followerId: current_user_id,
                    status: 0
                });
                var requestData = request_data_main.map(String);
                var requested = [...new Set(requestData)];

                const getUser_like = await likeSchema.distinct("post_id", {
                    user_id: current_user_id,
                    isLike: 1,
                }).exec();
                const liked_Ids = getUser_like.map(String);

                //getSavedPostIds
                let getSavedPostIds = await User.distinct("savedPosts._id", {_id: current_user_id }).exec();
                getSavedPostIds = getSavedPostIds.map(String);

                //voted
                let get_vote = await poll_voted.distinct("post_id", {
                    user_id: getpost_user_id
                }).exec();
                let votedIds = get_vote.map(String);
                
                //check
                if(getAll_Id.length)
                {
                    setFollow1();
                }
                else if(requested.length)
                {
                    setFollow2();
                }
                else if(liked_Ids.length)
                {
                    setisLiked();
                }
                else if(getSavedPostIds.length)
                {
                    setisSaved();
                }
                else if(votedIds.length)
                {
                    setisVoted();
                }
                else
                {
                    Response();
                } 
                
                //setFollow1
                function setFollow1()
                {
                    var count1 = 0;
                    var totalLength1 = arr_post.length * getAll_Id.length;
                    arr_post.forEach((data) => {
                        getAll_Id.forEach((followId) => {
                            if (followId == data.user_id._id) 
                            {
                                data.user_id.follow = 1;
                            }
                            count1 = count1 + 1;
                            if(totalLength1 == count1)
                            {
                                if(requested.length)
                                {
                                    setFollow2();
                                }
                                else if(liked_Ids.length)
                                {
                                    setisLiked();
                                }
                                else if(getSavedPostIds.length)
                                {
                                    setisSaved();
                                }
                                else if(votedIds.length)
                                {
                                    setisVoted();
                                }
                                else
                                {
                                    Response();
                                }
                            }
                        })
                    });
                }

                //setFollow2
                function setFollow2()
                {
                    var count2 = 0;
                    var totalLength2 = arr_post.length * requested.length;
                    arr_post.forEach((data) => {
                        requested.forEach((followId) => {
                            if (followId == data.user_id._id) 
                            {
                                data.user_id.follow = 2;
                            }
                            count2 = count2 + 1;
                            if(totalLength2 == count2)
                            {                       
                                if(liked_Ids.length)
                                {
                                    setisLiked();
                                }
                                else if(getSavedPostIds.length)
                                {
                                    setisSaved();
                                }
                                else if(votedIds.length)
                                {
                                    setisVoted();
                                }
                                else
                                {
                                    Response();
                                }
                            }
                        })
                    });
                }
                
                //setisLiked
                function setisLiked()
                {
                    var count3 = 0;
                    var totalLength3 = arr_post.length * liked_Ids.length;
                    arr_post.forEach((post) => {
                        liked_Ids.forEach((id) => {
                            if (id == post._id) 
                            {
                                post.isLiked = 1;
                            }
                            count3 = count3 + 1;
                            if(totalLength3 == count3)
                            {
                                if(getSavedPostIds.length)
                                {
                                    setisSaved();  
                                }
                                else if(votedIds.length)
                                {
                                    setisVoted();
                                }
                                else
                                {
                                    Response();
                                }
                            }
                        });
                    });
                }

                //setisSaved
                function setisSaved()
                {
                    var count4 = 0;
                    var totalLength4 = arr_post.length * getSavedPostIds.length;
                    arr_post.forEach((post) => {
                        getSavedPostIds.forEach((id) => {
                        if(id == post._id) 
                        {
                            post.isSaved = 1;
                        }
                        count4 = count4 + 1;
                        if(totalLength4 == count4)
                        {
                            if(votedIds.length)
                            {
                                setisVoted();
                            }
                            else
                            {
                                Response();
                            }
                        }
                        });
                    });
                }

                //setisVoted
                function setisVoted()
                {
                    var count5 = 0;
                    var totalLength5 = arr_post.length * votedIds.length;
                    arr_post.forEach((post) => {
                    votedIds.forEach(async(id) => {
                        if(id == post._id) 
                        {
                            const votedObj = await poll_voted.findOne({post_id: post._id,user_id: getpost_user_id });
                            post.selectedOptionId  = votedObj.option_id;
                            post.isVoted = 1;
                        }
                        count5 = count5 + 1;
                        if(totalLength5 == count5)
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
                        feeds: arr_post,
                        message: "Loops fetched successfully..."
                    });
                }   

            }
            else
            {
                return res.json({
                    success: true,
                    feeds: [],
                    message: "No loops",
                });
            }

        }
        else
        {
            return res.json({
                success: false,
                feeds: [],
                message: " No loops",
            });
        }
}

// Relooped posts
exports.user_reloopPost = async (req, res, next) => {

        const current_user_id = req.user_id;
        const getpost_user_id = req.query.user_id;
        //totalBlockedUser
        let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
        let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: current_user_id }).exec();
        let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
        //getHidePost
        let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: current_user_id }).exec();
        var get_post;
        if ((current_user_id).toString() == (getpost_user_id).toString()) {
            get_post = await Post.find({
                _id: {$nin: getHidePost},
                user_id: getpost_user_id,
                post_type: {$nin: [6,7]},
                isActive: true, 
                isDeleted: false,
                groupPost: false
            }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
        }
        else {
            const follower_data = await follow_unfollow.findOne({ followerId: current_user_id, followingId: getpost_user_id, status: 1 });
            if (follower_data) {
                get_post = await Post.find({
                    _id: {$nin: getHidePost},
                    user_id: { $in: getpost_user_id, $nin: totalBlockedUser },
                    privacyType: { $nin: "onlyMe" },
                    post_type: {$nin: [6,7]},
                    isActive: true, 
                    isDeleted: false,
                    groupPost: false
                }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
            }
            else {
                get_post = await Post.find({
                    _id: {$nin: getHidePost},
                    user_id: { $in: getpost_user_id, $nin: totalBlockedUser },
                    privacyType: { $nin: ["onlyMe", "private"] },
                    post_type: {$nin: [6,7]},
                    isActive: true, 
                    isDeleted: false,
                    groupPost: false
                }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
            }

        }
        const arr_post = [];
        if (get_post.length) 
        {
            get_post.forEach(post => {
                if (post.reloopPostId) {
                    arr_post.push(post)
                }
            })
            if (arr_post.length) {
                //follower_data
                const follower_data = await follow_unfollow.distinct("followingId", {
                    followerId: current_user_id,
                    status: 1
                });
                var change_string = follower_data.map(String);
                var getAll_Id = [...new Set(change_string)];
                //request_data_main
                const request_data_main = await follow_unfollow.distinct("followingId", {
                    followerId: current_user_id,
                    status: 0
                });
                var requestData = request_data_main.map(String);
                var requested = [...new Set(requestData)];

                const getUser_like = await likeSchema.distinct("post_id", {
                    user_id: current_user_id,
                    isLike: 1,
                }).exec();
                const liked_Ids = getUser_like.map(String);

                //getSavedPostIds
                let getSavedPostIds = await User.distinct("savedPosts._id", {_id: current_user_id }).exec();
                getSavedPostIds = getSavedPostIds.map(String);

                //check
                if(getAll_Id.length)
                {
                    setFollow1();
                }
                else if(requested.length)
                {
                    setFollow2();
                }
                else if(liked_Ids.length)
                {
                    setisLiked();
                }
                else if(getSavedPostIds.length)
                {
                    setisSaved();
                }
                else
                {
                    sendToResponse();
                } 

                //setFollow1
                function setFollow1()
                {
                    var count1 = 0;
                    var totalLength1 = arr_post.length * getAll_Id.length;
                    arr_post.forEach((data) => {
                        getAll_Id.forEach((followId) => {
                            if (followId == data.user_id._id) 
                            {
                                data.user_id.follow = 1;
                            }
                            count1 = count1 + 1;
                            if(totalLength1 == count1)
                            {
                                if(requested.length)
                                {
                                    setFollow2();
                                }
                                else if(liked_Ids.length)
                                {
                                    setisLiked();
                                }
                                else if(getSavedPostIds.length)
                                {
                                    setisSaved();
                                }
                                else
                                {
                                    sendToResponse();
                                }
                            }
                        })
                    });
                }

                //setFollow2
                function setFollow2()
                {
                    var count2 = 0;
                    var totalLength2 = arr_post.length * requested.length;
                    arr_post.forEach((data) => {
                        requested.forEach((followId) => {
                            if (followId == data.user_id._id) 
                            {
                                data.user_id.follow = 2;
                            }
                            count2 = count2 + 1;
                            if(totalLength2 == count2)
                            {                       
                                if(liked_Ids.length)
                                {
                                    setisLiked();
                                }
                                else if(getSavedPostIds.length)
                                {
                                    setisSaved();
                                }
                                else
                                {
                                    sendToResponse();
                                }
                            }
                        })
                    });
                }

                //setisLiked
                function setisLiked()
                {
                    var count3 = 0;
                    var totalLength3 = arr_post.length * liked_Ids.length;
                    arr_post.forEach((post) => {
                        liked_Ids.forEach((id) => {
                            if (id == post._id) 
                            {
                                post.isLiked = 1;
                            }
                            count3 = count3 + 1;
                            if(totalLength3 == count3)
                            {
                                if(getSavedPostIds.length)
                                {
                                    setisSaved();
                                }
                                else
                                {
                                    sendToResponse();
                                }
                            }
                        });
                    });
                }

                //setisSaved
                function setisSaved()
                {
                    var count4 = 0;
                    var totalLength4 = arr_post.length * getSavedPostIds.length;
                    arr_post.forEach((post) => {
                        getSavedPostIds.forEach((id) => {
                        if(id == post._id) 
                        {
                            post.isSaved = 1;
                        }
                        count4 = count4 + 1;
                        if(totalLength4 == count4)
                        {
                            sendToResponse();
                        }
                        });
                    });
                }

                //sendToResponse
                function sendToResponse()
                {
                    sendAllPost(arr_post,current_user_id,res)
                }
            }
            else 
            {
                return res.json({
                    success: true,
                    feeds: [],
                    message: "No relooped uploaded"
                });
            }

        }
        else 
        {
            return res.json({
                success: false,
                feeds: [],
                message: " No relooped Uploaded "
            });
        }
}

// tagged post
exports.user_taggedPost = async (req, res, next) => {
        const current_user_id = req.user_id;
        const getpost_user_id = req.query.user_id;

        const get_taggedPost = await TagPost.distinct("post_id", { tagged_userId: getpost_user_id }).exec();
        console.log(get_taggedPost);
        if (get_taggedPost.length) 
        {
            //totalBlockedUser
            let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
            let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: current_user_id }).exec();
            let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
            //getHidePost
            let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: current_user_id }).exec();
            var get_post;
            if ((current_user_id).toString() == (getpost_user_id).toString()) 
            {
                get_post = await Post.find({
                    _id: {$in: get_taggedPost,$nin: getHidePost},
                    user_id: { $nin: totalBlockedUser },
                    privacyType: { $nin: ["onlyMe"] },
                    post_type: {$nin: [6,7]},
                    isActive: true, 
                    isDeleted: false,
                    groupPost: false
                }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
            }
            else 
            {
                const follower_data = await follow_unfollow.findOne({ followerId: current_user_id, followingId: getpost_user_id, status: 1 });
                if (follower_data)
                {
                    get_post = await Post.find({
                        user_id: { $nin: totalBlockedUser },
                        _id: {$in: get_taggedPost,$nin: getHidePost},
                        privacyType: { $nin: ["onlyMe"] },
                        post_type: {$nin: [6,7]},
                        isActive: true, 
                        isDeleted: false,
                        groupPost: false
                    }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
                }
                else 
                {
                    get_post = await Post.find({
                        user_id: { $nin: totalBlockedUser },
                        _id: {$in: get_taggedPost,$nin: getHidePost},
                        privacyType: { $nin: ["onlyMe"] },
                        post_type: {$nin: [6,7]},
                        isActive: true, 
                        isDeleted: false,
                        groupPost: false
                    }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
                }

            }
            if (get_post.length) 
            {
                const arr_post = []
                get_post.forEach(post => {
                    if (post.reloopPostId == undefined) {
                        arr_post.push(post)
                    }
                })
                if (arr_post.length) 
                {
                    //follower_data
                    const follower_data = await follow_unfollow.distinct("followingId", {
                        followerId: current_user_id,
                        status: 1
                    });
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

                    //getSavedPostIds
                    let getSavedPostIds = await User.distinct("savedPosts._id", {_id: current_user_id }).exec();
                    getSavedPostIds = getSavedPostIds.map(String);

                    //check
                    if(getAll_Id.length)
                    {
                        setFollow1();
                    }
                    else if(requested.length)
                    {
                        setFollow2();
                    }
                    else if(liked_Ids.length)
                    {
                        setisLiked();
                    }
                    else if(getSavedPostIds.length)
                    {
                        setisSaved();
                    }
                    else
                    {
                        Response();
                    } 

                    //setFollow1
                    function setFollow1()
                    {
                        var count1 = 0;
                        var totalLength1 = arr_post.length * getAll_Id.length;
                        arr_post.forEach((data) => {
                            getAll_Id.forEach((followId) => {
                                if (followId == data.user_id._id) 
                                {
                                    data.user_id.follow = 1;
                                }
                                count1 = count1 + 1;
                                if(totalLength1 == count1)
                                {
                                    if(requested.length)
                                    {
                                        setFollow2();
                                    }
                                    else if(liked_Ids.length)
                                    {
                                        setisLiked();
                                    }
                                    else if(getSavedPostIds.length)
                                    {
                                        setisSaved();
                                    }
                                    else
                                    {
                                        Response();
                                    }
                                }
                            })
                        });
                    }

                    //setFollow2
                    function setFollow2()
                    {
                        var count2 = 0;
                        var totalLength2 = arr_post.length * requested.length;
                        arr_post.forEach((data) => {
                            requested.forEach((followId) => {
                                if (followId == data.user_id._id) 
                                {
                                    data.user_id.follow = 2;
                                }
                                count2 = count2 + 1;
                                if(totalLength2 == count2)
                                {                       
                                    if(liked_Ids.length)
                                    {
                                        setisLiked();
                                    }
                                    else if(getSavedPostIds.length)
                                    {
                                        setisSaved();
                                    }
                                    else
                                    {
                                        Response();
                                    }
                                }
                            })
                        });
                    }
                    
                    //setisLiked
                    function setisLiked()
                    {
                        var count3 = 0;
                        var totalLength3 = arr_post.length * liked_Ids.length;
                        arr_post.forEach((post) => {
                            liked_Ids.forEach((id) => {
                                if (id == post._id) 
                                {
                                    post.isLiked = 1;
                                }
                                count3 = count3 + 1;
                                if(totalLength3 == count3)
                                {
                                    if(getSavedPostIds.length)
                                    {
                                        setisSaved();
                                    }
                                    else
                                    {
                                        Response();
                                    }
                                }
                            });
                        });
                    }

                    //setisSaved
                    function setisSaved()
                    {
                        var count4 = 0;
                        var totalLength4 = arr_post.length * getSavedPostIds.length;
                        arr_post.forEach((post) => {
                            getSavedPostIds.forEach((id) => {
                            if(id == post._id) 
                            {
                                post.isSaved = 1;
                            }
                            count4 = count4 + 1;
                            if(totalLength4 == count4)
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
                            feeds: arr_post,
                            message: "Tagged loops fetched successfully.."
                        });
                    }
                }
                else
                {
                    return res.json({
                        success: false,
                        feeds: [],
                        message: " No tagged loop"
                    });
                }
            }
            else 
            {
                return res.json({
                    success: false,
                    feeds: [],
                    message: " No tagged loop"
                });
            }
        }
        else
        {
            return res.json({
                success: false,
                feeds: [],
                message: " No tagged loop"
            });
        }
}

// trending Post
exports.trending_post = async (req, res, next) => {
    const current_user_id = req.user_id;
    const offset = req.query.offset;
    var row = 10;
    let date_obj = new Date();
    let lastTwoDays = new Date(new Date().setDate(date_obj.getDate() - 2));
    //totalBlockedUser
    let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
    let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: current_user_id }).exec();
    let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
    //getHidePost
    let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: current_user_id }).exec();
    //reloopPostIds
    let reloopPostIds = await Post.distinct("reloopPostId", {}).exec();
    //get_post
    const get_post = await(await Post.find({
        _id: {$nin: getHidePost},
        user_id: { $nin: totalBlockedUser },
        reloopPostId: { $nin: reloopPostIds },
        created_at: { $gt: lastTwoDays },
        post_type: {$nin: [6,7]},
        isActive: true,
        isDeleted: false,
        groupPost: false,
        privacyType: { $nin: ["onlyMe","private"] }
    }).populate("user_id", "username avatar name private follow followersCount").sort({likeCount : -1 })).splice(offset == undefined ? 0 : offset, row);
    if (get_post.length) 
    {            
        //follower_data
        const follower_data = await follow_unfollow.distinct("followingId", {
            followerId: current_user_id,
            status: 1
        });
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

        //getSavedPostIds
        let getSavedPostIds = await User.distinct("savedPosts._id", {_id: current_user_id }).exec();
        getSavedPostIds = getSavedPostIds.map(String);

        //check
        if(getAll_Id.length)
        {
            setFollow1();
        }
        else if(requested.length)
        {
            setFollow2();
        }
        else if(liked_Ids.length)
        {
            setisLiked();
        }
        else if(getSavedPostIds.length)
        {
            setisSaved();
        }
        else
        {
            Response();
        }        
        
        //setFollow1
        function setFollow1()
        {
            var count1 = 0;
            var totalLength1 = get_post.length * getAll_Id.length;
            get_post.forEach((data) => {
                getAll_Id.forEach((followId) => {
                    if (followId == data.user_id._id) 
                    {
                        data.user_id.follow = 1;
                    }
                    count1 = count1 + 1;
                    if(totalLength1 == count1)
                    {
                        if(requested.length)
                        {
                            setFollow2();
                        }
                        else if(liked_Ids.length)
                        {
                            setisLiked();
                        }
                        else if(getSavedPostIds.length)
                        {
                            setisSaved();
                        }
                        else
                        {
                            Response();
                        }
                    }
                })
            });
        }
        
        //setFollow2
        function setFollow2()
        {
            var count2 = 0;
            var totalLength2 = get_post.length * requested.length;
            get_post.forEach((data) => {
                requested.forEach((followId) => {
                    if (followId == data.user_id._id) 
                    {
                        data.user_id.follow = 2;
                    }
                    count2 = count2 + 1;
                    if(totalLength2 == count2)
                    {                       
                        if(liked_Ids.length)
                        {
                            setisLiked();
                        }
                        else if(getSavedPostIds.length)
                        {
                            setisSaved();
                        }
                        else
                        {
                            Response();
                        }
                    }
                })
            });
        }
        
        //setisLiked
        function setisLiked()
        {
            var count3 = 0;
            var totalLength3 = get_post.length * liked_Ids.length;
            get_post.forEach((post) => {
                liked_Ids.forEach((id) => {
                    if (id == post._id) 
                    {
                        post.isLiked = 1;
                    }
                    count3 = count3 + 1;
                    if(totalLength3 == count3)
                    {
                        if(getSavedPostIds.length)
                        {
                            setisSaved();
                        }
                        else
                        {
                            Response();
                        }
                        
                    }
                });
            });
        }

        //setisSaved
        function setisSaved()
        {
            var count4 = 0;
            var totalLength4 = get_post.length * getSavedPostIds.length;
            get_post.forEach((post) => {
                getSavedPostIds.forEach((id) => {
                if(id == post._id) 
                {
                    post.isSaved = 1;
                }
                count4 = count4 + 1;
                if(totalLength4 == count4)
                {
                    Response();
                }
                });
            });
        }

        function Response()
        {
            return res.json({
                success: true,
                feeds: get_post,
                message: "Trending loop fetched successfully",
            });
        }              
        
    }
    else 
    {
        return res.json({
            success: false,
            feeds: [],
            message: "No Trending loop",
        });
    }
}


// trending post by category
exports.trending_postByCategory = async (req, res, next) => {

        const category_name = req.query.category_name;
        const current_user_id = req.user_id;
        const offset = req.query.offset;
        var row = 10;
        const loop = req.query.loop;
        let date_obj = new Date();
        // let oneHour = new Date(new Date().getTime() - 1000 * 60 * 60);
        // let oneDay = new Date(new Date().setDate(date_obj.getDate() - 30));
        var get_all_post;
        //totalBlockedUser
        let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
        let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: current_user_id }).exec();
        let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
        //getHidePost
        let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: current_user_id }).exec();
        //reloopPostIds
        let reloopPostIds = await Post.distinct("reloopPostId", {}).exec();
        if (loop == 1) 
        {
            get_all_post = await(await Post.find({
                _id: {$nin: getHidePost},
                user_id: { $nin: totalBlockedUser },
                category: category_name,
                reloopPostId: { $nin: reloopPostIds },
                post_type: {$nin: [6,7]},
                isActive: true,
                isDeleted: false,
                groupPost: false,
                privacyType: { $nin: ["onlyMe","private"] }
            }).populate("user_id", "username avatar name private follow").sort({ likeCount: -1 })).splice(offset == undefined ? 0 : offset, row);

        }
        else if (loop == 2) {
            get_all_post = await(await Post.find({
                _id: {$nin: getHidePost},
                user_id: { $nin: totalBlockedUser },
                category: category_name,
                reloopPostId: { $nin: reloopPostIds },
                post_type: {$nin: [6,7]},
                isActive: true,
                isDeleted: false,
                groupPost: false,
                privacyType: { $nin: ["onlyMe","private"] }
            }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 })).splice(offset == undefined ? 0 : offset, row);
        }

        if (get_all_post.length)
        {
            //follower_data
            const follower_data = await follow_unfollow.distinct("followingId", {
                followerId: current_user_id,
                status: 1
            });
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

            //getSavedPostIds
            let getSavedPostIds = await User.distinct("savedPosts._id", {_id: current_user_id }).exec();
            getSavedPostIds = getSavedPostIds.map(String);

            //check
            if(getAll_Id.length)
            {
                setFollow1();
            }
            else if(requested.length)
            {
                setFollow2();
            }
            else if(liked_Ids.length)
            {
                setisLiked();
            }
            else if(getSavedPostIds.length)
            {
                setisSaved();
            }
            else
            {
                Response();
            }
            
            //setFollow1
            function setFollow1()
            {
                var count1 = 0;
                var totalLength1 = get_all_post.length * getAll_Id.length;
                get_all_post.forEach((data) => {
                    getAll_Id.forEach((followId) => {
                        if (followId == data.user_id._id) 
                        {
                            data.user_id.follow = 1;
                        }
                        count1 = count1 + 1;
                        if(totalLength1 == count1)
                        {
                            if(requested.length)
                            {
                                setFollow2();
                            }
                            else if(liked_Ids.length)
                            {
                                setisLiked();
                            }
                            else if(getSavedPostIds.length)
                            {
                                setisSaved();
                            }
                            else
                            {
                                Response();
                            }
                        }
                    })
                });
            }


            //setFollow2
            function setFollow2()
            {
                var count2 = 0;
                var totalLength2 = get_all_post.length * requested.length;
                get_all_post.forEach((data) => {
                    requested.forEach((followId) => {
                        if (followId == data.user_id._id) 
                        {
                            data.user_id.follow = 2;
                        }
                        count2 = count2 + 1;
                        if(totalLength2 == count2)
                        {                       
                            if(liked_Ids.length)
                            {
                                setisLiked();
                            }
                            else if(getSavedPostIds.length)
                            {
                                setisSaved();
                            }
                            else
                            {
                                Response();
                            }
                        }
                    })
                });
            }

            //setisLiked
            function setisLiked()
            {
                var count3 = 0;
                var totalLength3 = get_all_post.length * liked_Ids.length;
                get_all_post.forEach((post) => {
                    liked_Ids.forEach((id) => {
                        if (id == post._id) 
                        {
                            post.isLiked = 1;
                        }
                        count3 = count3 + 1;
                        if(totalLength3 == count3)
                        {
                            if(getSavedPostIds.length)
                            {
                                setisSaved();
                            }
                            else
                            {
                                Response();
                            }
                        }
                    });
                });
            }

            //setisSaved
            function setisSaved()
            {
                var count4 = 0;
                var totalLength4 = get_all_post.length * getSavedPostIds.length;
                get_all_post.forEach((post) => {
                    getSavedPostIds.forEach((id) => {
                    if(id == post._id) 
                    {
                        post.isSaved = 1;
                    }
                    count4 = count4 + 1;
                    if(totalLength4 == count4)
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
                    feeds: get_all_post,
                    message: "Trending loop fetched successfully"
                });
            }
        }
        else 
        {
            return res.json({
                success: false,
                message: "No Trending loop"
            });
        }
}

//categoryPostForYou
exports.categoryPostForYou = async (req,res,next)=>{

    let user_id = req.user_id;
    const offset = req.query.offset;
    const type = req.query.type;

    var row = 10;
    let get_post;
    //categoryList
    let categoryList = await User.distinct("category",{_id: user_id}).exec();
    //totalBlockedUser
    let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: user_id }).exec();
    let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: user_id }).exec();
    let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
    //getHidePost
    let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: user_id }).exec();
    //reloopPostIds
    let reloopPostIds = await Post.distinct("reloopPostId", {}).exec();
    //get_post
    if(type == 0)
    {
        get_post = await(await Post.find({
            category: {$in: categoryList},
            _id: {$nin: getHidePost},
            user_id: { $nin: totalBlockedUser },
            reloopPostId: { $nin: reloopPostIds },
            post_type: {$nin: [4,6,7]},
            isActive: true,
            isDeleted: false,
            groupPost: false,
            privacyType: { $nin: ["onlyMe","private"] }
        }).populate("user_id", "username avatar name private follow").sort({created_at : -1 })).splice(offset == undefined ? 0 : offset, row);
    }
    else
    {
        get_post = await(await Post.find({
            category: {$in: categoryList},
            _id: {$nin: getHidePost},
            user_id: { $nin: totalBlockedUser },
            reloopPostId: { $nin: reloopPostIds },
            post_type: type,
            isActive: true,
            isDeleted: false,
            groupPost: false,
            privacyType: { $nin: ["onlyMe","private"] }
        }).populate("user_id", "username avatar name private follow").sort({created_at : -1 })).splice(offset == undefined ? 0 : offset, row);
    }

    if (get_post.length) 
    {            
        //follower_data
        const follower_data = await follow_unfollow.distinct("followingId", {
            followerId: user_id,
            status: 1
        });
        var change_string = follower_data.map(String);
        var getAll_Id = [...new Set(change_string)];
        //request_data_main
        const request_data_main = await follow_unfollow.distinct("followingId", {
            followerId: user_id,
            status: 0
        });
        var requestData = request_data_main.map(String);
        var requested = [...new Set(requestData)];
        //getUser_like
        const getUser_like = await likeSchema.distinct("post_id", {
            user_id: user_id,
            isLike: 1,
        }).exec();
        const liked_Ids = getUser_like.map(String);

        //getSavedPostIds
        let getSavedPostIds = await User.distinct("savedPosts._id", {_id: user_id }).exec();
        getSavedPostIds = getSavedPostIds.map(String);

        //check
        if(getAll_Id.length)
        {
            setFollow1();
        }
        else if(requested.length)
        {
            setFollow2();
        }
        else if(liked_Ids.length)
        {
            setisLiked();
        }
        else if(getSavedPostIds.length)
        {
            setisSaved();
        }
        else
        {
            Response();
        }        
        
        //setFollow1
        function setFollow1()
        {
            var count1 = 0;
            var totalLength1 = get_post.length * getAll_Id.length;
            get_post.forEach((data) => {
                getAll_Id.forEach((followId) => {
                    if (followId == data.user_id._id) 
                    {
                        data.user_id.follow = 1;
                    }
                    count1 = count1 + 1;
                    if(totalLength1 == count1)
                    {
                        if(requested.length)
                        {
                            setFollow2();
                        }
                        else if(liked_Ids.length)
                        {
                            setisLiked();
                        }
                        else if(getSavedPostIds.length)
                        {
                            setisSaved();
                        }
                        else
                        {
                            Response();
                        }
                    }
                })
            });
        }
        
        //setFollow2
        function setFollow2()
        {
            var count2 = 0;
            var totalLength2 = get_post.length * requested.length;
            get_post.forEach((data) => {
                requested.forEach((followId) => {
                    if (followId == data.user_id._id) 
                    {
                        data.user_id.follow = 2;
                    }
                    count2 = count2 + 1;
                    if(totalLength2 == count2)
                    {                       
                        if(liked_Ids.length)
                        {
                            setisLiked();
                        }
                        else if(getSavedPostIds.length)
                        {
                            setisSaved();
                        }
                        else
                        {
                            Response();
                        }
                    }
                })
            });
        }
        
        //setisLiked
        function setisLiked()
        {
            var count3 = 0;
            var totalLength3 = get_post.length * liked_Ids.length;
            get_post.forEach((post) => {
                liked_Ids.forEach((id) => {
                    if (id == post._id) 
                    {
                        post.isLiked = 1;
                    }
                    count3 = count3 + 1;
                    if(totalLength3 == count3)
                    {
                        if(getSavedPostIds.length)
                        {
                            setisSaved();
                        }
                        else
                        {
                            Response();
                        }
                    }
                });
            });
        }

        //setisSaved
        function setisSaved()
        {
            var count4 = 0;
            var totalLength4 = get_post.length * getSavedPostIds.length;
            get_post.forEach((post) => {
                getSavedPostIds.forEach((id) => {
                if(id == post._id) 
                {
                    post.isSaved = 1;
                }
                count4 = count4 + 1;
                if(totalLength4 == count4)
                {
                    Response();
                }
                });
            });
        }

        function Response()
        {
            return res.json({
                success: true,
                feeds: get_post,
                message: "Multiple category post fetched successfully",
            });
        }              
        
    }
    else 
    {
        return res.json({
            success: false,
            feeds: [],
            message: "No loop"
        });
    }

}

//multipleCategoryPost
exports.multipleCategoryPost = async (req,res,next)=>{

    let user_id = req.user_id;
    const offset = req.query.offset;
    const type = req.query.type;

    var row = 10;
    let get_post;

    //categoryList
    let categoryList = await User.distinct("category",{_id: user_id}).exec();
    //totalBlockedUser
    let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: user_id }).exec();
    let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: user_id }).exec();
    let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
    //getHidePost
    let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: user_id }).exec();
    //reloopPostIds
    let reloopPostIds = await Post.distinct("reloopPostId", {}).exec();

    if(type == 0)
    {
        get_post = await(await Post.find({
            category: {$nin: categoryList},
            _id: {$nin: getHidePost},
            user_id: { $nin: totalBlockedUser },
            reloopPostId: { $nin: reloopPostIds },
            post_type: {$nin: [4,5,6,7]},
            isActive: true,
            isDeleted: false,
            groupPost: false,
            privacyType: { $nin: ["onlyMe","private"] }
        }).populate("user_id", "username avatar name private follow").sort({created_at : -1 })).splice(offset == undefined ? 0 : offset, row);
    }
    else
    {
        get_post = await(await Post.find({
            category: {$nin: categoryList},
            _id: {$nin: getHidePost},
            user_id: { $nin: totalBlockedUser },
            reloopPostId: { $nin: reloopPostIds },
            post_type: type,
            isActive: true,
            isDeleted: false,
            groupPost: false,
            privacyType: { $nin: ["onlyMe","private"] }
        }).populate("user_id", "username avatar name private follow").sort({created_at : -1 })).splice(offset == undefined ? 0 : offset, row);
    }
    

    if (get_post.length) 
    {            
        //follower_data
        const follower_data = await follow_unfollow.distinct("followingId", {
            followerId: user_id,
            status: 1
        });
        var change_string = follower_data.map(String);
        var getAll_Id = [...new Set(change_string)];
        //request_data_main
        const request_data_main = await follow_unfollow.distinct("followingId", {
            followerId: user_id,
            status: 0
        });
        var requestData = request_data_main.map(String);
        var requested = [...new Set(requestData)];
        //getUser_like
        const getUser_like = await likeSchema.distinct("post_id", {
            user_id: user_id,
            isLike: 1,
        }).exec();
        const liked_Ids = getUser_like.map(String);

        //getSavedPostIds
        let getSavedPostIds = await User.distinct("savedPosts._id", {_id: user_id }).exec();
        getSavedPostIds = getSavedPostIds.map(String);

        //check
        if(getAll_Id.length)
        {
            setFollow1();
        }
        else if(requested.length)
        {
            setFollow2();
        }
        else if(liked_Ids.length)
        {
            setisLiked();
        }
        else if(getSavedPostIds.length)
        {
            setisSaved();
        }
        else
        {
            Response();
        }        
        
        //setFollow1
        function setFollow1()
        {
            var count1 = 0;
            var totalLength1 = get_post.length * getAll_Id.length;
            get_post.forEach((data) => {
                getAll_Id.forEach((followId) => {
                    if (followId == data.user_id._id) 
                    {
                        data.user_id.follow = 1;
                    }
                    count1 = count1 + 1;
                    if(totalLength1 == count1)
                    {
                        if(requested.length)
                        {
                            setFollow2();
                        }
                        else if(liked_Ids.length)
                        {
                            setisLiked();
                        }
                        else if(getSavedPostIds.length)
                        {
                            setisSaved();
                        }
                        else
                        {
                            Response();
                        }
                    }
                })
            });
        }
        
        //setFollow2
        function setFollow2()
        {
            var count2 = 0;
            var totalLength2 = get_post.length * requested.length;
            get_post.forEach((data) => {
                requested.forEach((followId) => {
                    if (followId == data.user_id._id) 
                    {
                        data.user_id.follow = 2;
                    }
                    count2 = count2 + 1;
                    if(totalLength2 == count2)
                    {                       
                        if(liked_Ids.length)
                        {
                            setisLiked();
                        }
                        else if(getSavedPostIds.length)
                        {
                            setisSaved();
                        }
                        else
                        {
                            Response();
                        }
                    }
                })
            });
        }
        
        //setisLiked
        function setisLiked()
        {
            var count3 = 0;
            var totalLength3 = get_post.length * liked_Ids.length;
            get_post.forEach((post) => {
                liked_Ids.forEach((id) => {
                    if (id == post._id) 
                    {
                        post.isLiked = 1;
                    }
                    count3 = count3 + 1;
                    if(totalLength3 == count3)
                    {
                        if(getSavedPostIds.length)
                        {
                            setisSaved();
                        }
                        else
                        {
                            Response();
                        }
                    }
                });
            });
        }

        //setisSaved
        function setisSaved()
        {
            var count4 = 0;
            var totalLength4 = get_post.length * getSavedPostIds.length;
            get_post.forEach((post) => {
                getSavedPostIds.forEach((id) => {
                if(id == post._id) 
                {
                    post.isSaved = 1;
                }
                count4 = count4 + 1;
                if(totalLength4 == count4)
                {
                    Response();
                }
                });
            });
        }

        function Response()
        {
            return res.json({
                success: true,
                feeds: get_post,
                message: "For you category post fetched successfully"
            });
        }              
        
    }
    else 
    {
        return res.json({
            success: false,
            feeds: [],
            message: "No loop",
        });
    }

}
