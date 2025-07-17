var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import roomRoutes from "./routes/room.js";
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
app.use("/api/room", roomRoutes);
app.get("/", (req, res) => {
    res.send("Socket.IO Server is running!");
});
const PORT = process.env.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connectDB(); // ✅ Wait for MongoDB to connect
        server.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT}`);
        });
    }
    catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1); // Exit with failure
    }
});
startServer();
