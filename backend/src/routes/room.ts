import express, { Request, Response } from "express";
import { identifyUser} from "../middleware/identifyUser";
import { enforceRoomLimit } from "../middleware/roomLimit";
import { Room } from "../models/Room";

const router = express.Router();

interface CustomRequest extends Request {
  user?: { userId: string };
}

router.post("/create", async (req: CustomRequest, res: Response) => {
  try {
    const uid = req.user?.userId;
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
    return;
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Server error." });
    return;
  }
});

export default router;
