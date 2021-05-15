const twilio = require("twilio");
const axios = require("axios");

class Twillio {
     async sendOtp(otp, receiverNo){
        const url = 'https://2factor.in/API/V1/5fc5bd12-7687-11ea-9fa5-0200cd936042/SMS/+91' + receiverNo + '/' + otp;
        try {
            const response = await axios.get(url);
        } catch (exception) {
            console.log("qqqqqqqqqqqqqqqq")
            process.stderr.write(`ERROR received from ${url}: ${exception}\n`);
        }
} };

module.exports = Twillio;