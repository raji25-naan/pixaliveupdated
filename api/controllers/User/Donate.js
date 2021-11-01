const User = require("../../models/User/Users");
const Donate = require("../../models/User/Donate")

//increase_coins
exports.increase_coins = async function(user_id,coin){

    const addCoins = await User.updateOne(
        {_id: user_id},
        {
            $inc : {coins: coin}
        },
        {new: true}
    );

}

//add_Coins
exports.add_Coins = async(req,res,next)=>{

    const user_id = req.user_id;
    const coin = req.body.coin;

    const addCoins = await User.updateOne(
        {_id: user_id},
        {
            $inc : {coins: coin}
        },
        {new: true}
    );

    if(addCoins)
    {
        return res.json({
            success: true,
            message: "Added coin successfully"
        })
    }
    else if(error)
    {
        return res.json({
            success: false,
            message: "error occured"+error
        })
    }

}

//donate_trees_seeds
exports.donate_trees_seeds = async(req,res,next)=>{

    let user_id = req.user_id;
    let {type,coins,donatedUser_id} = req.body;
    let post_id;
    if(req.body.post_id)
    {
        post_id = req.body.post_id;
    }
    else
    {
        post_id = null;
    }

    //checkType
    if(type == 1) //seed
    {
        var seedBalls = coins / 10;
        const data = new Donate({
            coins: coins,
            seedBalls: seedBalls,
            donatedUser_id: donatedUser_id,
            donatedByUser_id: user_id,
            post_id: post_id
        });

        const saveData = await data.save();
        if(saveData)
        {
            return res.json({
                success: true,
                message: "Donated SeedBalls successfully"
            })
        }
        else
        {
            return res.json({
                success: false,
                message: "error occured"
            })
        }
    }
    else if(type == 2) //tree
    {
        var trees = coins / 100;
        const data = new Donate({
            coins: coins,
            trees: trees,
            donatedUser_id: donatedUser_id,
            donatedByUser_id: user_id,
            post_id: post_id
        });

        const saveData = await data.save();
        if(saveData)
        {
            return res.json({
                success: true,
                message: "Donated trees successfully"
            })
        }
        else
        {
            return res.json({
                success: false,
                message: "error occured"
            })
        }
    }

}