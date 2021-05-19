const express = require("express");
const router = express.Router();
const Hashtag = require("../../models/User/hashtags");
const user = require("../../models/User/Users");

router.post("/create", async(req,res) => {
    console.log(req.body);
    const follow = await user.updateOne(
        {_id : req.body.userId},
        {
           $push : {"followedHashtag" : {
               _id : req.body.hashId,
               hashtag:req.body.hashtag
            } } 
        },{new:true}
    ).exec();
    console.log(follow);
    return res.send(follow)
})

module.exports = router;