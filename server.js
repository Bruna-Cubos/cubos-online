const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let sessionState = {
  size: 2,
  limit: 60,
  elapsed: 0,
  running: false
};

io.on("connection", (socket) => {
  socket.emit("update", sessionState);

  socket.on("start", (data) => {
    sessionState = { ...sessionState, ...data, elapsed: 0, running: true };
    io.emit("update", sessionState);
  });

  socket.on("tick", () => {
    if (sessionState.running) {
      sessionState.elapsed++;
      if (sessionState.elapsed >= sessionState.limit) {
        sessionState.running = false;
      }
      io.emit("update", sessionState);
    }
  });

  socket.on("finish", () => {
    sessionState.running = false;
    io.emit("update", sessionState);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
