const nodemailer = require('nodemailer');

module.exports.sendOtpToEmail = function(mailOptions) {
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'outlook',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'info@pixalive.me', // generated ethereal user
                pass: 'Welcome@123' // generated ethereal password
            }
        });
        
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });
    });

}
