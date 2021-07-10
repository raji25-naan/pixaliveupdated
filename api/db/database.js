const mongoose = require('mongoose');

function makeNewConnection(uri) {
    mongoose.set('debug', true)
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);
    const db = mongoose.createConnection(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    db.on('error', function (error) {
        console.log(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`);
        db.close().catch(() => console.log(`MongoDB :: failed to close connection ${this.name}`));
    });

    db.on('connected', function () {
        mongoose.set('debug', function (col, method, query, doc) {
            console.log(`MongoDB :: ${this.conn.name} ${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`);
        });
        console.log(`MongoDB :: connected ${this.name}`);
    });

    db.on('disconnected', function () {
        console.log(`MongoDB :: disconnected ${this.name}`);
    });

    return db;
}

const db_Main = makeNewConnection("mongodb+srv://Pixalive-Live:pixalive@123@cluster0.3nhlt.mongodb.net/pixaliveDB?retryWrites=true&w=majority");
const db_Chat = makeNewConnection("mongodb+srv://pixaliveChat_db:pixalive123@cluster0.gmuwr.mongodb.net/pixaliveChat_db?retryWrites=true&w=majority");
module.exports = { db_Main, db_Chat };


//Connect to MongoDB
// module.exports = class mongoconnect {
//     connectToDb(){
//         try {
//             mongoose.set('debug', true)
//             mongoose.set('useCreateIndex', true);
//             mongoose.set('useFindAndModify', false);
//             const connected = mongoose.connect(Config.SERVER.MONGODB_URL, { useNewUrlParser: true });
//             if(connected)
//             {
//                 console.info('Connected to Database');
//             }
//         } catch (err) {
//             console.error('Connection error' + err);
//         }

//     }
// }