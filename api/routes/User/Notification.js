const express = require("express");
const { getUnreadCount, updateReadCount, updateNotification } = require("../../controllers/User/Notification");
const { checkQuery, validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.post("/updateNotification",
updateNotification
);

router.get("/getUnreadCount",checkQuery("userId"),validateRequest,getUnreadCount);

router.post("/updateReadCount",checkRequestBodyParams("notifyId"),validateRequest,updateReadCount);


module.exports = router;