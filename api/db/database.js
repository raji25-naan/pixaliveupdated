const mongoose = require('mongoose');
const Config = require("../../Config/Environtment")


//Connect to MongoDB
module.exports = class mongoconnect {
    connectToDb(){
        try {
            mongoose.set('debug', true)
            mongoose.set('useCreateIndex', true);
            mongoose.set('useFindAndModify', false);
            const connected = mongoose.connect(Config.SERVER.MONGODB_URL, { useNewUrlParser: true });
            if(connected)
            {
                console.info('Connected to Database');
            }
        } catch (err) {
            console.error('Connection error' + err);
        }

    }
}