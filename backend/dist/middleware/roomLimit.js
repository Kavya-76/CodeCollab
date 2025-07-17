var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Room } from "../models/Room.js";
const GUEST_ROOM_LIMIT = 1;
const AUTH_ROOM_LIMIT = 5;
export const enforceRoomLimit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userType, userId } = req;
    if (!userId) {
        res.status(400).json({ message: "User ID not provided" });
        return;
    }
    try {
        // Count rooms where this user is the admin (i.e., created them)
        const roomCount = yield Room.countDocuments({ adminId: userId });
        if ((userType === "authenticated" && roomCount >= AUTH_ROOM_LIMIT) ||
            (userType === "guest" && roomCount >= GUEST_ROOM_LIMIT)) {
            const message = userType === "authenticated"
                ? "You have reached the room limit (5)."
                : "Guests can only create 1 room.";
            res.status(403).json({ message });
            return;
        }
        next();
    }
    catch (err) {
        console.error("Room limit check failed:", err);
        res.status(500).json({ message: "Room limit check failed", error: err });
    }
});
