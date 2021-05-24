var socket_io = require("socket.io");
var io = socket_io();
io.on("connection", (socket) => {
  console.log("connected");
});
