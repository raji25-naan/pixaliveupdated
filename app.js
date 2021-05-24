var mongoconnect = require("./api/db/database");
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
const storyRouter = require("./api/routes/User/story");
const hashtagRouter = require("./api/routes/User/hashtag");
const TagpostRouter = require("./api/routes/User/userTagpost");
const categoryRouter = require("./api/routes/User/category");
const fileUpload = require("express-fileupload");


//admin router
const registerRouter = require("./api/routes/Admin/register.routes");

//firebaseAdmin
// global.admin = require("firebase-admin");
// const serviceAccount = require("./api/serviceAccountkey.json");
// global.admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://pixalive-fa208-default-rtdb.firebaseio.com/",
// });

app.use(timeout("20s"));

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb" }));
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50mb" }));

console.log("APP.JS LINE: 17");

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 1000000,
  })
);

//DatabaseConnection
connectDatabase();
function connectDatabase() {
  return new mongoconnect().connectToDb();
}

//userRoutes
let userRoutes = [].concat(userRouter,postRouter,follow_unfollowRouter,likeRouter,commentRouter,storyRouter,hashtagRouter,TagpostRouter,categoryRouter);
//adminRoutes
let adminRoutes = [].concat(registerRouter);

app.use("/api/user",userRoutes);
app.use("/api/admin",adminRoutes);
//user router
// app.use("/api/User/user", userRouter);
// app.use("/api/User/posts", postRouter);
// app.use("/api/User/follow_unfollow", follow_unfollowRouter);
// app.use("/api/User/like", likeRouter);
// app.use("/api/User/comments", commentRouter);
// app.use("/api/User/story",storyRouter);
// app.use("/api/User/hashtag",hashtagRouter);
// app.use("/api/User/tagPost",TagpostRouter);
// app.use("/api/User/category",categoryRouter);

//admin router
// app.use("/api/Admin/register",registerRouter);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(haltOnTimedout);
app.use(cookieParser());
app.use(haltOnTimedout);
app.use(cors());

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

module.exports = app;
