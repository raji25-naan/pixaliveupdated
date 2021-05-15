const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { getUrl } = require('./getUrl');
const { sendOtpToEmail } = require('./emailSms');

module.exports.SendEmailVerificationLink = function(otp,req,user){

    let verificationToken = jwt.sign(
        {
            id: user._id,
            email: user.email
        },
        process.env.JWT_KEY,
        {
            expiresIn: "90d"
        }
    );
    const template = process.cwd() + '/api/views/emailer.ejs';
    fs.readFile(template, 'utf8', (err, file) => {
        let compiledTmpl = ejs.compile(file, {
            filename: template
        });
        let baseUrl = getUrl(req) + '/api/verify_otp/?varifyToken=' + verificationToken;
        let url = getUrl(req);
        //context
        let context = {
            'verification-token': verificationToken,
            username: user.username,
            'user_otp': otp,
            'baseUrl': baseUrl,
            'url': url,
            forgot_template_text: "This is your OTP Dont share with anyone"
        };
        //html
        let html = compiledTmpl(context);
        let mailOptions = {
            from: 'mail@pixalive.me',
            to: user.email,
            subject: 'Verify email',
            html: html
        };
        sendOtpToEmail(mailOptions)
    })

}