const express = require("express");
const { getUnreadCount, updateReadCount, updateNotification, getAllNotificationByuser } = require("../../controllers/User/Notification");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkQuery, validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.get("/getAllNotificationByuser",
            checkSession,
            checkIsactive,
            getAllNotificationByuser
        )

router.post("/updateNotification",
updateNotification
);

router.get("/getUnreadCount",checkQuery("userId"),validateRequest,getUnreadCount);

router.post("/updateReadCount",checkRequestBodyParams("notifyId"),validateRequest,updateReadCount);


module.exports = router;