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
    const typedReq = req;
    const { userType, userId, ipAddress } = typedReq;
    try {
        if (userType === "authenticated") {
            if (!userId) {
                res.status(400).json({ message: "UID not provided" });
                return;
            }
            const user = yield User.findOne({ firebaseUid: userId }).populate("rooms");
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            const activeRooms = user.rooms.filter((room) => room.isActive);
            if (activeRooms.length >= AUTH_ROOM_LIMIT) {
                res.status(403).json({ message: "You have reached the room limit (5)." });
                return;
            }
        }
        else if (userType === "guest") {
            if (!ipAddress) {
                res.status(400).json({ message: "IP address not available" });
                return;
            }
            const guestRooms = yield Room.find({
                createdByIp: ipAddress,
                isGuest: true,
            });
            if (guestRooms.length >= GUEST_ROOM_LIMIT) {
                res.status(403).json({ message: "Guests can only create 1 room." });
                return;
            }
        }
        next();
    }
    catch (err) {
        console.error("Room limit check failed:", err);
        res.status(500).json({ message: "Room limit check failed", error: err });
    }
});
