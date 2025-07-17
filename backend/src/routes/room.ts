import express, { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { identifyUser } from "../middleware/identifyUser";
import { enforceRoomLimit } from "../middleware/roomLimit";
import { Room } from "../models/Room";

const router = express.Router();

router.post("/create", identifyUser, enforceRoomLimit, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid || req.userId;
    if (!uid) {
      res.status(400).json({ message: "UID not provided" });
      return;
    }

    const roomId = `room_${Math.random().toString(36).substring(2, 9)}`;

    const newRoom = new Room({
      roomId,
      adminId: uid,
      members: [
        {
          uid,
          joinedAt: new Date(),
        },
      ],
      createdAt: new Date(),
    });

    await newRoom.save();

    res.status(200).json({
      message: "Room created successfully",
      roomId,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;