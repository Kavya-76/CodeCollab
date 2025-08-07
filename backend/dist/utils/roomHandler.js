var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { User } from "../models/User";
import { Room } from "../models/Room";
const activeRooms = new Map();
// 🔹 Create new room
function createRoom({ roomId, adminUid, adminName, language, }) {
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
function joinRoom(roomId, socketId, name, uid) {
    const room = activeRooms.get(roomId);
    if (room) {
        room.members.set(socketId, { name, uid });
    }
}
// 🔹 Leave room
function leaveRoom(roomId, socketId) {
    const room = activeRooms.get(roomId);
    if (room) {
        room.members.delete(socketId);
    }
}
// 🔹 Update code
function updateCode(roomId, newCode) {
    const room = activeRooms.get(roomId);
    if (room) {
        room.code = newCode;
    }
}
// 🔹 Get room meta
function getRoom(roomId) {
    return activeRooms.get(roomId);
}
// 🔹 Count connected users
function getUserCount(roomId) {
    var _a;
    return ((_a = activeRooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.members.size) || 0;
}
// 🔹 Get active rooms (debug)
function getActiveRooms() {
    return activeRooms;
}
// 🔹 Cleanup room if empty & save for users
function saveAndCleanIfEmpty(roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = activeRooms.get(roomId);
        if (!room || room.members.size > 0)
            return;
        // Save for each authenticated user (max 5)
        for (const { uid, name } of room.members.values()) {
            if (!uid)
                continue;
            const user = yield User.findOne({ uid });
            if (!user)
                continue;
            if (user.rooms.size >= 5) {
                // Optional: notify user via socket about save limit
                continue;
            }
            user.rooms.set(roomId, {
                roomId,
                code: room.code,
                language: room.language,
                joinedAt: room.createdAt,
                leftAt: new Date(),
            });
            yield user.save();
        }
        yield Room.deleteOne({ roomId });
        activeRooms.delete(roomId);
    });
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
