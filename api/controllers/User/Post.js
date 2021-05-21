const postSchema = require("../../models/User/Post");
const viewPost = require("../../models/User/viewPost");
const hashtagSchema = require("../../models/User/hashtags");
const reportPost = require("../../models/User/reportPost");
// ************* Create post Using user_Id ***************//

exports.create_post = async (req, res, next) => {
  try {
    let { image, body, thumbnail, user_id } = req.body;
    const updateFavourtie = new postSchema({
      thumbnail: thumbnail,
      image: image,
      body: body,
      user_id: user_id,
      created_at: new Date(),
    });

    const saveData = await updateFavourtie.save();

    if (saveData) {
      return res.json({
        success: true,
        message: "Post added",
      });
    } else {
      return res.json({
        success: false,
        message: "Error adding post",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error adding post",
    });
  }
};

exports.create_postNew = async (req, res, next) => {
  try {
    const { text, url, body, thumbnail, user_id, place, type } = req.body;
    // string.match(/#\w+/g)
    var arr_hash = body.match(/(^|\s)#(\w+)/g);
    console.log(arr_hash);
    var hash_tag = [];
    if (arr_hash) {
      console.log(arr_hash);
      arr_hash = arr_hash.map(function (v) {
        return v.trim().substring(1);
      });
      hash_tag.push(...arr_hash);
      const get_hashtag = await hashtagSchema.distinct("hashtag", {
        hashtag: arr_hash,
      });
      console.log(get_hashtag);
      hash_tags = new Set(get_hashtag.map((tag) => tag));

      arr_hash = arr_hash.filter((id) => !hash_tags.has(id));

      console.log(arr_hash);

      arr_hash.forEach(async (element) => {
        const hashtag = new hashtagSchema({
          hashtag: element,
          created_at: new Date(),
        }).save();
      });
    }
    if (type == 1)
      update_postwithType(
        user_id,
        url,
        "",
        "",
        "",
        thumbnail,
        body,
        place,
        type,
        hash_tag,
        res
      );
    if (type == 2)
      update_postwithType(
        user_id,
        "",
        "",
        url,
        "",
        thumbnail,
        body,
        place,
        type,
        hash_tag,
        res
      );
    if (type == 3)
      update_postwithType(
        user_id,
        "",
        url,
        "",
        "",
        thumbnail,
        body,
        place,
        type,
        hash_tag,
        res
      );
    if (type == 4)
      update_postwithType(
        user_id,
        "",
        "",
        "",
        text,
        thumbnail,
        body,
        place,
        type,
        hash_tag,
        res
      );
  } catch (error) {
    return res.json({
      success: false,
      message: "Error adding post" + error,
    });
  }
};

async function update_postwithType(
  userId,
  video,
  image,
  audio,
  text,
  thumbnail,
  body,
  place,
  type,
  hashtag,
  res
) {
  console.log("text", video, image, audio, text);
  try {
    var createdPost = await new postSchema({
      user_id: userId,
      video_url: video,
      image_url: image,
      audio_url: audio,
      text_content: text,
      thumbnail: thumbnail,
      body: body,
      place: place,
      post_type: type,
      hastag: hashtag,
      created_at: Date.now(),
    }).save();
    return res.json({
      success: true,
      message: createdPost,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error adding post" + error,
    });
  }
}

// ************* Get post Using Post_id ***************//

exports.get_post = async (req, res, next) => {
  try {
    const post_id = req.query.post_id;
    const userPost = await postSchema.findOne({ _id: post_id });
    if (userPost) {
      return res.json({
        success: true,
        post: userPost,
      });
    } else {
      return res.json({
        success: false,
        message: "Error occured! ",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

// ************* Get all post of the user Using user_Id ***************//

exports.user_posts = async (req, res, next) => {
  try {
    const user_id = req.query.user_id;
    const userPost = await postSchema.find({ user_id: user_id });
    if (userPost) {
      return res.json({
        success: true,
        post: userPost,
      });
    } else {
      return res.json({
        success: false,
        message: "Error occured! ",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

// ************* delete post Using post_ID ***************//

exports.delete_post = async (req, res, next) => {
  try {
    const post_id = req.body.post_id;

    if (post_id == undefined) {
      return res.json({
        success: false,
        message: "Please insert post id!",
      });
    }

    const userPost = await postSchema.findOneAndDelete({ _id: post_id });
    if (userPost) {
      return res.json({
        success: true,
        message: "Post Removed Successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Error occured! ",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

// Get user feeds using user_id and fix offset

exports.feeds = async (req, res, next) => {
  try {
    var { offset, user_id } = req.query;
    var row = 20;
    const get_userfeeds = await (await postSchema.find({ user_id: user_id }))
      .reverse()
      .splice(offset == undefined ? 0 : offset, row);
    return res.json({
      success: true,
      feeds: get_userfeeds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

// ************* get all feed of all users ***********//
exports.all_feeds = async (req, res, next) => {
  try {
    var { offset } = req.query;
    var row = 20;

    const all_feeds = await (await postSchema.find())
      .reverse()
      .splice(offset == undefined ? 0 : offset, row);
    return res.json({
      success: true,
      feeds: all_feeds,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

// sort by date
function sortFunction(a, b) {
  var dateA = new Date(a.date).getTime();
  var dateB = new Date(b.date).getTime();
  return dateA > dateB ? 1 : -1;
}

//updateviewPost
exports.updateviewpost = async (req, res, next) => {
  try {
    let { user_id, post_id, postUserId } = req.body;
    //getViewdata
    const getViewdata = await viewPost
      .find({
        post_id: post_id,
        viewed_userId: user_id,
        post_userID: postUserId,
      })
      .exec();
    if (getViewdata.length > 0) {
      return res.json({
        success: false,
        message: "Already viewed",
      });
    } else {
      const data = new viewPost({
        post_id: post_id,
        viewed_userId: user_id,
        post_userID: postUserId,
      });
      const saveData = await data.save();
      if (saveData) {
        return res.json({
          success: true,
          message: "Post viewed successfully",
        });
      }
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

//createReport
exports.createReport = async(req,res,next)=>{
  try
  {
    const{post_id,user_id,report}= req.body;
    const reports = new reportPost({
      post_id : post_id,
      reportedByid : user_id,
      report : report
    });
    const saveReport = await reports.save();
    if(saveReport)
    {
      return res.json({
      success : true,
      message:"Reported successfully"
      })
    }else{
      return res.json({
      success:false,
      msg:"Your report is not taken..try again!"
    })
    }
  }
  catch(error){
    return res.json({
      success:false,
      msg:"error occured!"+error
    })
  }
 
}

// exploreFeedsbyLocation
exports.exploreFeedsbyLocation = async (req,res,next) => {
  try {
    var {lat,lng} = req.query;
    const sameLocationPosts = await postSchema.find({lat:lat,lng:lng}).exec();
    if(sameLocationPosts.length > 0){
      return res.json({
        success:true,
        result : sameLocationPosts,
        message:"Post fetched successfully"
      })
    }
    else{
      return res.json({
        success:false,
        message:'No data Found'
      })
    }
  } 
  catch (error) {
    return res.json({
      success:false,
      message:'error'
    })
  }
}