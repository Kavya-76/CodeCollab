import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Change this in production!
    methods: ["GET", "POST"],
  },
});

interface CustomSocket extends Socket {
  username?: string;
  roomId?: string;
}

interface User {
  id: string;
  username: string;
  isActive?: boolean;
}

const roomUsers: Record<string, User[]> = {};
const roomCode: Record<string, string> = {};
const roomOutput: Record<string, string> = {};

app.get("/", (req, res) => {
  res.send("Socket.IO Server is running!");
});

io.on("connection", (socket: CustomSocket) => {
  console.log("Socket is on: ", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;

    if (!roomUsers[roomId]) {
      roomUsers[roomId] = [];
    }

    const userData: User = { id: socket.id, username };
    if (!roomUsers[roomId].some((user) => user.id === socket.id)) {
      roomUsers[roomId].push(userData);
    }

    io.to(roomId).emit("user-list", roomUsers[roomId]);
  });

  socket.on("user-activity", ({ roomId, userId, isActive }) => {
    if (roomUsers[roomId]) {
      const user = roomUsers[roomId].find((u) => u.id === userId);
      if (user) {
        (user as any).isActive = isActive;
        io.to(roomId).emit("user-list", roomUsers[roomId]);
      }
    }
  });

  socket.on("leave-room", ({ roomId, username }) => {
    socket.leave(roomId);
    roomUsers[roomId] = roomUsers[roomId]?.filter(
      (user) => user.id !== socket.id
    );
    if (roomUsers[roomId]?.length === 0) delete roomUsers[roomId];

    io.to(roomId).emit("user-list", roomUsers[roomId] || []);
    socket.to(roomId).emit("user-left", { id: socket.id, username });
  });

  socket.on("code-change", ({ roomId, code }) => {
    roomCode[roomId] = code;
    socket.to(roomId).emit("code-change", code);
  });

  socket.on("output-result", ({ roomId, output }) => {
    roomOutput[roomId] = output;
    socket.to(roomId).emit("output-result", output);
  });

  socket.on("start-execution", ({ roomId, username }) => {
    socket.to(roomId).emit("execution-locked", { username });
  });

  socket.on("end-execution", ({ roomId }) => {
    socket.to(roomId).emit("execution-unlocked");
  });

  socket.on("disconnect", () => {
    const { roomId, username } = socket;
    if (!roomId) return;

    roomUsers[roomId] = roomUsers[roomId]?.filter(
      (user) => user.id !== socket.id
    );
    if (roomUsers[roomId]?.length === 0) {
      delete roomUsers[roomId];
      delete roomCode[roomId];
      delete roomOutput[roomId];
    }

    io.to(roomId).emit("user-list", roomUsers[roomId] || []);
    socket.to(roomId).emit("user-left", { id: socket.id, username });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
