import { User } from "../models/User";
import { Room } from "../models/Room";

type RoomMeta = {
  roomId: string;
  adminUid?: string;
  adminName: string;
  language: string;
  code: string;
  members: Map<string, { name: string; uid?: string }>; // socketId → user info
  createdAt: Date;
};

const activeRooms = new Map<string, RoomMeta>();

// 🔹 Create new room
function createRoom({
  roomId,
  adminUid,
  adminName,
  language,
}: {
  roomId: string;
  adminUid?: string;
  adminName: string;
  language: string;
}) {
  activeRooms.set(roomId, {
    roomId,
    adminUid,
    adminName,
    code: "",
    language,
    members: new Map(),
    createdAt: new Date(),
  });

//   save room to DB for current state tracking
  const room = new Room({
    roomId,
    adminUid,
    adminName,
    language,
    createdAt: new Date(),
    members: [],
  });
  room.save();
}

// 🔹 Join room
function joinRoom(
  roomId: string,
  socketId: string,
  name: string,
  uid?: string
) {
  const room = activeRooms.get(roomId);
  if (room) {
    room.members.set(socketId, { name, uid });
  }
}

// 🔹 Leave room
function leaveRoom(roomId: string, socketId: string) {
  const room = activeRooms.get(roomId);
  if (room) {
    room.members.delete(socketId);
  }
}

// 🔹 Update code
function updateCode(roomId: string, newCode: string) {
  const room = activeRooms.get(roomId);
  if (room) {
    room.code = newCode;
  }
}

// 🔹 Get room meta
function getRoom(roomId: string): RoomMeta | undefined {
  return activeRooms.get(roomId);
}

// 🔹 Count connected users
function getUserCount(roomId: string): number {
  return activeRooms.get(roomId)?.members.size || 0;
}

// 🔹 Get active rooms (debug)
function getActiveRooms() {
  return activeRooms;
}

// 🔹 Cleanup room if empty & save for users
async function saveAndCleanIfEmpty(roomId: string) {
  const room = activeRooms.get(roomId);
  if (!room || room.members.size > 0) return;

  // Save for each authenticated user (max 5)
  for (const { uid, name } of room.members.values()) {
    if (!uid) continue;

    const user = await User.findOne({ uid });
    if (!user) continue;

    if (user.rooms.length >= 5) {
      // Optional: notify user via socket about save limit
      continue;
    }

    user.rooms.push({
      roomId,
      adminName: room.adminName,
      code: room.code,
      language: room.language,
      collaborators: Array.from(room.members.values()).map((m) => m.name),
      joinedAt: room.createdAt,
      leftAt: new Date(),
    });

    await user.save();
  }

  await Room.deleteOne({ roomId });
  activeRooms.delete(roomId);
}

export const roomManager = {
  createRoom,
  joinRoom,
  leaveRoom,
  updateCode,
  getRoom,
  getUserCount,
  saveAndCleanIfEmpty,
  getActiveRooms,
};