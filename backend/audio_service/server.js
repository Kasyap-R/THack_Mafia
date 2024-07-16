const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const HOST_URL = process.env.HOST_URL;
const origins = [`${HOST_URL}:3000`, "*"];

app.use(
  cors({
    origin: origins,
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: origins,
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Server is running.");
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("audioStream", (audioData) => {
    console.log("Received audio data from:", socket.id);
    socket.emit("audioStream", audioData);
    socket.broadcast.emit("audioStream", audioData);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const port = 8000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
