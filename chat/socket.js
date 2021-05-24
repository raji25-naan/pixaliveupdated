const jwt = require("jsonwebtoken");
const messageSchema = require("../api/models/User/chat");

var socket_io = require("socket.io");
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on("connection", (socket) => {
  console.log(socket);
  var channel = socket.handshake.query.channel;
  var token = socket.handshake.query.token;

  if (verifyToken(token)) {
    socket.join(channel);
    console.log("Joined " + channel);
  } else {
    //console.log('Token invalid disconnected!');
    socket.disconnect();
    return;
  }

  //Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    socket.leave(channel);
  });
});

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (decoded.id != undefined) return true;
    else return false;
  } catch (error) {
    return false;
  }
}

module.exports = socketApi;
