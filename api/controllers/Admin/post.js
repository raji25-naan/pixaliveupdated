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

exports.getPostDetail = async(req,res,next)=>{

    try 
    {
       const getPost = await Post.findOne({_id:req.query.post_id}).populate('user_id','username first_name last_name avatar email country_code created_At').exec();
        if(getPost)
        {
            return res.json({
                success: true,
                result: getPost,
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
    catch (error) {
        return res.json({
            success: false,
            message: "Error occured!" + error,
          });
    }
}