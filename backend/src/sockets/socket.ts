import { Server, Socket } from "socket.io";
// import { saveCodeForUser } from "../utils/saveCode";

interface CustomSocket extends Socket {
  username?: string;
  roomId?: string;
  uid?: string;
  isGuest?: boolean;
}

interface User {
  id: string;
  username: string;
  isActive?: boolean;
  uid?: string;
  isGuest?: boolean;
}

type RoomState = {
  code?: string;
  output?: string;
  language?: string;
  languageId?: string | number;
};

const roomUsers: Record<string, User[]> = {};
const roomState = new Map<string, RoomState>();

export const handleSocketConnection = (io: Server, socket: CustomSocket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", ({ roomId, username, uid, isGuest }) => {
    socket.join(roomId);
    Object.assign(socket, { username, roomId, uid, isGuest });

    if (!roomUsers[roomId]) roomUsers[roomId] = [];

    const userData: User = { id: socket.id, username, uid, isGuest };
    if (!roomUsers[roomId].some((u) => u.id === socket.id)) {
      roomUsers[roomId].push(userData);
    }

    io.to(roomId).emit("user-list", roomUsers[roomId]);
    socket.emit("load-code", roomState.get(roomId)?.code || "");
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", code);
    const state = roomState.get(roomId) || {};
    roomState.set(roomId, { ...state, code });
  });

  socket.on("output-result", ({ roomId, output }) => {
    socket.to(roomId).emit("output-result", output);
    const state = roomState.get(roomId) || {};
    roomState.set(roomId, { ...state, output });
  });

  socket.on("language-change", ({ roomId, language, languageId }) => {
    socket.to(roomId).emit("language-change", { newLanguage: language, newLanguageId: languageId });
    const state = roomState.get(roomId) || {};
    roomState.set(roomId, { ...state, language, languageId });
  });

  socket.on("user-activity", ({ roomId, userId, isActive }) => {
    const user = roomUsers[roomId]?.find((u) => u.id === userId);
    if (user) {
      user.isActive = isActive;
      io.to(roomId).emit("user-list", roomUsers[roomId]);
    }
  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    roomUsers[roomId] = roomUsers[roomId]?.filter((u) => u.id !== socket.id);
    if (!roomUsers[roomId]?.length) {
      delete roomUsers[roomId];
      roomState.delete(roomId);
    }
    io.to(roomId).emit("user-list", roomUsers[roomId] || []);
  });

  socket.on("start-execution", ({ roomId, username }) => {
    socket.to(roomId).emit("execution-locked", { username });
  });

  socket.on("end-execution", ({ roomId }) => {
    socket.to(roomId).emit("execution-unlocked");
  });

  socket.on("disconnect", async () => {
    const { roomId, username, uid, isGuest } = socket;
    if (!roomId) return;

    roomUsers[roomId] = roomUsers[roomId]?.filter((u) => u.id !== socket.id);
    if (!roomUsers[roomId]?.length) {
      delete roomUsers[roomId];
      roomState.delete(roomId);
    }

    if (uid && !isGuest) {
      const code = roomState.get(roomId)?.code || "";
      console.log("Saving the code for user: ",code);
    //   await saveCodeForUser(uid, code); // ✅ save code
    }

    io.to(roomId).emit("user-list", roomUsers[roomId] || []);
    socket.to(roomId).emit("user-left", { id: socket.id, username });
  });
};
