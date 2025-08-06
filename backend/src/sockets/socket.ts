import { Server, Socket } from "socket.io";
import { User } from "../models/User.js";

interface CustomSocket extends Socket {
  roomId?: string;
  userId?: string;
  username?: string;
  isGuest?: boolean;
}

interface User {
  id: string; // socketId
  username: string;
  userId?: string;
  isActive?: boolean;
  isGuest?: boolean;
  joinedAt: Date;
}

type RoomState = {
  code: string; // code in the room
  language?: string;
  languageId?: string;
  output?: string;
};

type RoomData = {
  state: RoomState;
  users: Map<string, User>; // key = socket.id
};

const ROOM_LIMITS = {
  guest: 1,
  authenticated: 5,
};

const roomsData = new Map<string, RoomData>();
const userActiveRooms = new Map<string, Set<string>>();
const pendingRemovals = new Map();

export const handleSocketConnection = (io: Server, socket: CustomSocket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", ({ roomId, userId, username, isGuest }) => {
    if (!roomId || !userId || !username) {
      socket.emit("room-error", "Missing required parameters");
      return;
    }

    // Cancel pending removal for this user-room key (if any)
    const leaveKey = `${userId}:${roomId}`;
    if (pendingRemovals.has(leaveKey)) {
      clearTimeout(pendingRemovals.get(leaveKey)!);
      pendingRemovals.delete(leaveKey);
    }

    const userType = isGuest ? "guest" : "authenticated";
    const maxRoomsAllowed = ROOM_LIMITS[userType];

    const activeRoomsSet = userActiveRooms.get(userId) || new Set();
    const alreadyJoined = activeRoomsSet.has(roomId);

    if (!alreadyJoined && activeRoomsSet.size >= maxRoomsAllowed) {
      socket.emit(
        "room-error",
        `Room limit reached (${maxRoomsAllowed}) for ${userType} users`
      );
      return;
    }

    socket.join(roomId);

    Object.assign(socket, { username, userId, roomId, isGuest });

    if (!roomsData.has(roomId)) {
      roomsData.set(roomId, {
        state: {
          code: "", // or load initial code if you have
        },
        users: new Map(),
      });
    }

    const room = roomsData.get(roomId)!;

    // Always add the roomId to userActiveRooms (even if already joined)
    activeRoomsSet.add(roomId);
    userActiveRooms.set(userId, activeRoomsSet);

    if (alreadyJoined) {
      // Emit current user list and code to this socket only
      socket.emit("user-list", Array.from(room.users.values()));
      socket.emit("load-code", room.state.code || "");
      return;
    }

    const userData: User = {
      id: socket.id,
      userId,
      username,
      isGuest,
      joinedAt: new Date(),
    };

    room.users.set(userId, userData);

    io.to(roomId).emit("user-list", Array.from(room.users.values()));
    socket.emit("load-code", room.state.code || "");
  });

  socket.on("user-activity", ({ roomId, userId, isActive }) => {
    const room = roomsData.get(roomId);
    if (!room) return;

    const user = room.users.get(userId);
    if (user) {
      user.isActive = isActive;
      io.to(roomId).emit("user-list", Array.from(room.users.values()));
    }
  });

  // Leave room event (e.g., explicit leave button)
  socket.on("leave-room", ({ roomId, userId }) => {
    if (!roomId || !userId) return;

    // Remove room from user's activeRooms
    const activeRoomsSet = userActiveRooms.get(userId);
    if (activeRoomsSet) {
      activeRoomsSet.delete(roomId);
      if (activeRoomsSet.size === 0) userActiveRooms.delete(userId);
      else userActiveRooms.set(userId, activeRoomsSet);
    }

    // Remove user from room's user list
    const room = roomsData.get(roomId);
    if (room) {
      room.users.delete(userId);
      io.to(roomId).emit("user-list", Array.from(room.users.values()));

      // Clean empty room
      if (room.users.size === 0) {
        roomsData.delete(roomId);
      }
    }

    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    const { userId, roomId } = socket;

    if (!userId || !roomId) return;

    const leaveKey = `${userId}:${roomId}`;

    // Start debounce timer to avoid removing immediately on refresh
    const timeout = setTimeout(() => {
      // Remove room from user's activeRooms
      const activeRoomsSet = userActiveRooms.get(userId);
      if (activeRoomsSet) {
        activeRoomsSet.delete(roomId);
        if (activeRoomsSet.size === 0) userActiveRooms.delete(userId);
        else userActiveRooms.set(userId, activeRoomsSet);
      }

      // Remove user from room users map
      const room = roomsData.get(roomId);
      if (room) {
        room.users.delete(userId);
        io.to(roomId).emit("user-list", Array.from(room.users.values()));

        if (room.users.size === 0) {
          roomsData.delete(roomId);
        }
      }

      pendingRemovals.delete(leaveKey);
    }, 4000); // 4 seconds debounce, adjust as needed

    // Save timeout id
    pendingRemovals.set(leaveKey, timeout);
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", code);
    const room = roomsData.get(roomId) || {
      state: {
        code: "",
        language: "",
        languageId: "",
        output: "",
      },
      users: new Map(),
    };
    room.state.code = code;
    roomsData.set(roomId, room);
  });

  socket.on("output-result", ({ roomId, output }) => {
    socket.to(roomId).emit("output-result", output);

    const room = roomsData.get(roomId) || {
      state: {
        code: "",
        language: "",
        languageId: "",
        output: "",
      },
      users: new Map(),
    };
    room.state.output = output;
    roomsData.set(roomId, room);
  });

  socket.on("language-change", ({ roomId, language, languageId }) => {
    socket.to(roomId).emit("language-change", {
      newLanguage: language,
      newLanguageId: languageId,
    });

    const room = roomsData.get(roomId) || {
      state: {
        code: "",
        language: "",
        languageId: "",
        output: "",
      },
      users: new Map(),
    };
    room.state.language = language;
    room.state.languageId = languageId;

    roomsData.set(roomId, room);
  });

  socket.on("start-execution", ({ roomId, username }) => {
    socket.to(roomId).emit("execution-locked", { username });
  });

  socket.on("end-execution", ({ roomId }) => {
    socket.to(roomId).emit("execution-unlocked");
  });
};
