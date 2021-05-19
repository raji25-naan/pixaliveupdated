const Post = require('../../models/User/Post');
const TagPost = require('../../models/User/userTagpost');

exports.tagged_post = async (req,res,next) => {
    try {
      const {userId} = req.body;
      const taggedPostId = await TagPost.distinct("post_id",{tagged_userId:userId}).exec();
      //getPosts
      const getPosts = await Post.find({_id:taggedPostId}).exec();
        if(getPosts.length>0)
        {
          return res.json({
            success:true,
            results:getPosts,
            message:"Tagged posts fetched successfully"
          })
        }
        else{
          return res.json({
            success:false,
            message:"No data found"
          })
        }
    } catch (error) {
      return res.json({
        success:false,
        message:"Error occured",error
      })
    }
  }