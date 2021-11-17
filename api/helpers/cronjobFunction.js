const Post = require("../models/User/Post");
const Users = require("../models/User/Users");
const Hashids = require("hashids");
const hashids = new Hashids();
const chatSchema = require("../models/User/chat");
const Group = require("../models/User/group");
const uniqid = require("uniqid");

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

exports.getIdWrkExp = async (req,res)=>{

    let ids = await Users.distinct("_id",{WorkExperience:{$elemMatch:{Designation:""}}});
    console.log(ids);

    await Users.updateMany(
        {_id: ids},
        {
            $set: {WorkExperience: []}
        },
        {new: true}
    )

    // let ids = await Users.distinct("_id",{Qualification:{$elemMatch:{InstituteName:""}}});
    // console.log(ids);

    // await Users.updateMany(
    //     {_id: ids},
    //     {
    //         $set: {Qualification: []}
    //     },
    //     {new: true}
    // )

} 

exports.updateGroupCategory = async function(){
    await Group.updateMany({
        // category: "Others",
        category: "Official"
    });
}

exports.addReferelCode = async function(){

    const userList = await Users.find();
    userList.forEach(async(data)=>{
        // var code = uniqid.time();
        // var referalCode = code.slice(0,-2);
        let otp = Math.floor(1000 + Math.random() * 9000);
        const referalCode = uniqid(otp);
        await Users.findOneAndUpdate(
            {_id: data._id},
            {
                $set: {
                    referalCode: referalCode.slice(0,-13)
                }
            },
            {new: true}
        );
    })

}