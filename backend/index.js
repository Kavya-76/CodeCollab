import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const cors = require('cors');

// Serve static files if needed (like frontend)
app.get("/", (req, res) => {
  res.send("Socket.IO Server is running!");
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for a custom event
  socket.on("chat message", (msg) => {
    console.log("Message received:", msg);
    // Broadcast to all connected clients
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
