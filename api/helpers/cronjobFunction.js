const Post = require("../models/User/Post");
const Users = require("../models/User/Users");
const Hashids = require("hashids");
const hashids = new Hashids();
const chatSchema = require("../models/User/chat");

exports.updateEncryptId = async function(){

    // let data = await Post.findOne({_id:"60b4fcc82ee8ff29602ebf38"});
    // let ids = data.encryptId;
    // const enc = hashids.decodeHex(ids);
    // console.log(enc);
    

    let getPost = await Post.distinct("_id",{});
    let getPostString = getPost.map(String);
    getPostString.forEach(async(data)=>{
        await Post.findOneAndUpdate(
            {_id: data},
            {
                $set:{encryptId: hashids.encodeHex(data)}
            },{new: true}
        );
    })

}

exports.addNotification = async (req,res,next)=>{

    await Users.updateMany({Notification: true});

}

exports.addMediaDatatype = async (req,res,next)=>{

    // await Post.updateMany({media_datatype: ""});
    
    // await Post.updateMany({
    //     comment_option: true,
    //     download_option: true
    // });

    // await Post.updateMany({
    //     groupPost: false,
    //     showInFeeds: true
    // });

    await Post.updateMany({
        verified: true
    });
}

exports.updateSeenchatSchema = async (req,res,next)=>{
     
    await chatSchema.updateMany({isSeen: true});
}