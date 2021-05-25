const Post = require("../../models/User/Post");

exports.getAllPost = async(req,res,next)=>{

    try
    {
        const getPosts = await Post.find({}).sort({created_at: -1}).populate('user_id','username isActive').exec();
        if(getPosts.length>0)
        {
            return res.json({
                success: true,
                result: getPosts,
                message: "Fetched posts successfully"
              }); 
        }
        else
        {
            return res.json({
                success: false,
                message: "No data found"
              });
        }
    }
    catch(error)
    {
        return res.json({
            success: false,
            message: "Error occured!" + error,
          });
    }
}