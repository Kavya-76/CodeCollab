var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Room } from "../models/Room";
import { User } from "../models/User";
const GUEST_ROOM_LIMIT = 1;
const AUTH_ROOM_LIMIT = 5;
export const enforceRoomLimit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userType, userId, ipAddress } = req;
    try {
        if (userType === "authenticated") {
            if (!userId)
                return res.status(400).json({ message: "UID not provided" });
            // Fetch MongoDB user by Firebase UID (assumes UID is used as _id or linked field)
            const user = yield User.findOne({ firebaseUid: userId }).populate("rooms");
            if (!user)
                return res.status(404).json({ message: "User not found" });
            const activeRooms = user.rooms.filter((room) => room.isActive);
            if (activeRooms.length >= AUTH_ROOM_LIMIT) {
                return res.status(403).json({ message: "You have reached the room limit (5)." });
            }
        }
        else if (userType === "guest") {
            if (!ipAddress)
                return res.status(400).json({ message: "IP address not available" });
            const guestRooms = yield Room.find({ createdByIp: ipAddress, isGuest: true });
            if (guestRooms.length >= GUEST_ROOM_LIMIT) {
                return res.status(403).json({ message: "Guests can only create 1 room." });
            }
        }
        next();
    }
    catch (err) {
        console.error("Room limit check failed:", err);
        return res.status(500).json({ message: "Room limit check failed", error: err });
    }
});
