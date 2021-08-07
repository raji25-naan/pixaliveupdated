const Post = require("../models/User/Post");
const Hashids = require("hashids");
const hashids = new Hashids();

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