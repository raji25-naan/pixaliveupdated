const Users = require("../models/User/Users");
global.admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountkey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pixalive-fa208-default-rtdb.firebaseio.com/",
});


module.exports.verifyGCMToken = function(fcmToken) {
    console.log(1);
    return admin.messaging().send({
        token: fcmToken
    }, true)
}

module.exports.sendNotification = function(sender, receiver, type) {
    var message;
    var title;

    if (type == 0) {
        title = 'New like';
        message = ' liked your post';

    }
    else if (type == 1) {
        title = 'New comment';
        message = ' commented on your post';
    }
    else {
        title = 'New follow';
        message = ' started following you';
    }
    //getUserInfo
    const receiverInfo = Users.findById({_id:receiver});
    const senderInfo = Users.findById({_id:sender});

    if (receiverInfo && senderInfo) {
        var registrationTokens = [
            receiverInfo.gcm_token
        ];

        var payload = {
            notification: {
                title: title,
                body: senderInfo.username + message,
            }
        };

        admin.messaging().sendToDevice(registrationTokens, payload)
            .then((response) => {
                console.log('Notification sent!');

            })
            .catch((error) => {
                console.log('Notification failed! ' + error);

            });
    }

}