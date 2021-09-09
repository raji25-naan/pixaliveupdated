const groupPost = require("../../models/User/groupPost");

exports.createPostOnGroup = async(req,res,next)=>{

    let {group_id,url,type} = req.body;
    let user_id = req.user_id;

    const postData = new groupPost({
        group_id: group_id,
        url: url,
        post_type: type,
        user_id: user_id
    });

    const saveData = await postData.save();

    if(saveData)
    {
        return res.json({
            success: true,
            message: "Successfully Posted"
        })
    }
    else
    {
        return res.json({
            success: false,
            message: "Error Occured"
        })
    }
}

//getGroupPost
exports.getGroupPost = async(req,res,next)=>{

    let group_id = req.query.group_id;

    const getPost = await groupPost.find({group_id: group_id,isActive: true,isDeleted: false}).exec();

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