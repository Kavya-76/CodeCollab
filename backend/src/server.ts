import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js"
import roomRoutes from "./routes/room.js"
import { handleSocketConnection } from "./sockets/socket.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  handleSocketConnection(io, socket);
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/rooms", roomRoutes);
app.get("/", (req, res) => {
  res.send("Socket.IO Server is running!");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // ✅ Wait for MongoDB to connect
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1); // Exit with failure
  }
};

startServer();
