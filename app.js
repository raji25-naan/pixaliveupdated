// var mongoconnect = require("./api/db/database");
var createError = require("http-errors");
var express = require("express");
var app = express();
var userRouter = require("./api/routes/User/user.routes");
var timeout = require("connect-timeout");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
var postRouter = require("./api/routes/User/post.routes");
const follow_unfollowRouter = require("./api/routes/User/follow_unfollow");
const likeRouter = require("./api/routes/User/like.routes");
const commentRouter = require("./api/routes/User/comment.routes");
const hashtagRouter = require("./api/routes/User/hashtag");
const storyRouter = require("./api/routes/User/story.routes");
const TagpostRouter = require("./api/routes/User/userTagpost");
const categoryRouter = require("./api/routes/User/category");
const chatRouter = require("./api/routes/User/chat.routes");
const notificationRouter = require("./api/routes/User/Notification");
const user_profileRouter = require("./api/routes/User/user_profile.routes");
const blockedRouter = require("./api/routes/User/blockedUser.routes");
const groupRouter = require("./api/routes/User/group");
const groupPostRouter = require("./api/routes/User/groupPost");
const draftRouter = require("./api/routes/User/draft");
const CronJob = require('node-cron');
const fileUpload = require("express-fileupload");

//admin router
const registerRouter = require("./api/routes/Admin/register");
const postAdminRouter = require("./api/routes/Admin/post");
const storyAdminRouter = require("./api/routes/Admin/story");
const { updateEncryptId, addNotification, addMediaDatatype, updateSeenchatSchema, getIdWrkExp, updateGroupCategory } = require("./api/helpers/cronjobFunction");
//firebaseAdmin
// global.admin = require("firebase-admin");
// const serviceAccount = require("./api/serviceAccountkey.json");
// global.admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://pixalive-fa208-default-rtdb.firebaseio.com/",
// });

app.use(timeout("20s"));
app.use(cors());

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb" }));
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50mb" }));
app.use('/profile_avatar', express.static(path.join(__dirname, 'profile_avatar')));
console.log("APP.JS LINE: 17");

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 1000000,
  })
);

//DatabaseConnection
// connectDatabase();
// function connectDatabase() {
//   return new mongoconnect().connectToDb();
// }


//userRoutes
let userRoutes = [].concat(
  userRouter,
  postRouter,
  follow_unfollowRouter,
  likeRouter,
  commentRouter,
  storyRouter,
  hashtagRouter,
  TagpostRouter,
  categoryRouter,
  notificationRouter,
  chatRouter,
  user_profileRouter,
  blockedRouter,
  groupRouter,
  groupPostRouter,
  draftRouter
);
//adminRoutes
let adminRoutes = [].concat(registerRouter, postAdminRouter, storyAdminRouter);

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

//apple-app-site
app.get("/.well-known/apple-app-site-association",(req,res)=>{
  res.json({
    "applinks": {
      "apps": [],
      "details": [
        {
          "appID": "ZPDMUQZHR2.com.Pixalive",
          "paths": [
            "*"
          ]
        }
      ]
    }
  })
})

//getServerTime
app.get('/api/User/getServerTime', (req, res) => {
  try 
  {
    res.send({
    'success': true,
    'time': new Date(),
    'message': 'Current Time'
    })
  } 
  catch (e) 
  {
    res.send({
    'success': false,
    'message': 'Failed to get Time'
    })
  }
  })

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(haltOnTimedout);
app.use(cookieParser());
app.use(haltOnTimedout);
app.use(function (err, req, res, next) {
  return res.json({
    success: false,
    message: "error occur" + err
  })
})

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, authtoken, access_token, Accept, authorization"
  );
  res.header("Access-Control-Allow-Methods", "*");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

CronJob.schedule('0 41 17 * * *', async () => {
  // console.info(`running cron job a task ${new Date()}`);

  // await updateEncryptId();
  // await addNotification();
  // await addMediaDatatype();
  // await updateSeenchatSchema();
  // await getIdWrkExp();
  // await updateGroupCategory();
})


module.exports = app;
