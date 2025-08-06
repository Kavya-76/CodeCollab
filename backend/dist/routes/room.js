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
import { identifyUser } from "../middleware/identifyUser.js";
import { enforceRoomLimit } from "../middleware/roomLimit.js";
import { Room } from "../models/Room.js";
const router = express.Router();
router.post("/create", identifyUser, enforceRoomLimit, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const uid = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || req.userId;
        if (!uid) {
            res.status(400).json({ message: "UID not provided" });
            return;
        }
        const roomId = `room_${Math.random().toString(36).substring(2, 9)}`;
        const newRoom = new Room({
            roomId,
            adminId: uid,
            createdAt: new Date(),
        });
        yield newRoom.save();
        res.status(200).json({
            message: "Room created successfully",
            roomId,
            uid
        });
    }
    catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: "Server error." });
    }
}));
export default router;
