const Notification = require("../../models/User/Notification");

module.exports.getAllNotificationByuser = async(req,res,next)=>{
 
    let user_id = req.user_id;
    const offset = req.query.offset;
    var row = 20;
    const getAllNotify = await(await Notification.find({receiver_id:user_id,type: {$nin: 3}}).populate("sender_id","username name avatar follow private")
    .populate("receiver_id","username name avatar follow private").populate("post_id","thumbnail url").sort({created_at : -1})).splice(offset == undefined ? 0 : offset, row);
    
    if(getAllNotify.length)
    {
        return res.json({
            success : true,
            result : getAllNotify,
            message: "Notifications fetched successfully"
        })
    }
    else
    {
        return res.json({
            success : true,
            result : getAllNotify,
            message: "No notifications"
        })
    }
}

//getFollowReqNotificationByuser
module.exports.getFollowReqNotificationByuser = async(req,res,next)=>{

    let user_id = req.user_id;
    const offset = req.query.offset;
    var row = 20;
    const getAllNotify = await(await Notification.find({receiver_id:user_id,type: {$in: 3}}).populate("sender_id","username name avatar follow private")
    .populate("receiver_id","username name avatar follow private").sort({created_at : -1})).splice(offset == undefined ? 0 : offset, row);

    if(getAllNotify.length)
    {
        return res.json({
            success : true,
            result : getAllNotify,
            message: "Request Notifications fetched successfully"
        })
    }
    else
    {
        return res.json({
            success : true,
            result : getAllNotify,
            message: "No notifications"
        })
    }

}

module.exports.updateNotification = async(req,res,next)=>{

    let {sender_id,receiver_id,message,title} = req.body;
    // let sender_id = sender;
    // let receiver_id = receiver;
    // let message = message;
    // let title = title;

    const saveNotify = new Notification({
        sender_id : sender_id,
        receiver_id : receiver_id,
        message : message,
        title : title,
        read : false
    });
    const notifySaved = await saveNotify.save();
    if(notifySaved)
    {
        res.json({
            success:true,
            message:"Notified successfully"
        })
    }
    else if(error)
    {
        res.json({
            success:false,
            message:"Error occured"+error
        })
    }

}

module.exports.getUnreadCount = async(req,res,next)=>{

    try 
    {
        let receiver_id = req.user_id;
        const getUnreadData = await Notification.find({receiver_id:receiver_id,seen:false}).exec();
        var count = getUnreadData.length;
        if(getUnreadData.length>0)
        {
            return res.json({
                success:true,
                count:count
            })
        }
        else
        {
            return res.json({
                success:false,
                count: "",
                message:"No unread message"
            }) 
        }
    } catch (error) {
        res.json({
            success:false,
            message:"Error occured"+error
        })
    }
}

module.exports.updateReadCount = async(req,res,next)=>{

    try 
    {
        const notifyId = req.body.notifyId;
        const saveRead = await Notification.updateOne(
            {_id:notifyId},
            {
                $set:{seen:true}
            },
            {new : true}
        );
        if(saveRead)
        {
            return res.json({
                success:true,
                message:"Updated notification seen"
            }) 
        }
        else
        {
            return res.json({
                success:false,
                message:"Error occured"+error
            })
        }
    } catch (error) {
        res.json({
            success:false,
            message:"Error occured"+error
        })
    }
}
