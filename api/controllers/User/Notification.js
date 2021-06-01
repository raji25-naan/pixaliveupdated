const Notification = require("../../models/User/Notification");

module.exports.getAllNotificationByuser = async(req,res,next)=>{

    let user_id = req.user_id;
    const getAllNotify = await Notification.find({receiver_id:user_id}).populate("sender_id","username first_name last_name avatar")
    .populate("receiver_id","username first_name last_name avatar").exec();
    if(getAllNotify.length>0)
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
        let {receiver_id} = req.query.userId;
        const getUnreadData = await Notification.find({receiver_id:receiver_id,read:false}).exec();
        let result = [];
        var count = getUnreadData.length;
        result.push(getUnreadData);
        result.push(count);
        if(getUnreadData.length>0)
        {
            res.json({
                success:true,
                result:result
            })
        }
        else
        {
            res.json({
                success:false,
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
        const saveRead = await Notification.updateOne(
            {_id:req.body.notifyId},
            {
                $set:{read:true}
            },
            {new : true}
        );
        if(saveRead)
        {
            res.json({
                success:true,
                message:"Updated notification read"
            }) 
        }
        else
        {
            res.json({
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