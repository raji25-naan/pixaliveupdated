const express = require("express");
const { getUnreadCount, updateReadCount, updateNotification, getAllNotificationByuser, getFollowReqNotificationByuser } = require("../../controllers/User/Notification");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const {checkRequestBodyParams, checkQuery, validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.get("/getAllNotificationByuser",
            checkSession,
            checkIsactive,
            getAllNotificationByuser
        )

router.get("/getFollowReqNotificationByuser",
        checkSession,
        checkIsactive,
        getFollowReqNotificationByuser
    )

router.post("/updateNotification",
updateNotification
);

router.get("/getUnreadCount",
            checkSession,
            checkIsactive,
            getUnreadCount);

router.post("/updateReadCount",
        checkSession,
        checkIsactive,
        checkRequestBodyParams("notifyId"),
        validateRequest,
        updateReadCount);

module.exports = router;