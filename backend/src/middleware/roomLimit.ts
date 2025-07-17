import { Request, Response, NextFunction } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { Room } from "../models/Room";
import { User } from "../models/User";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken; // From Firebase
  userType: "authenticated" | "guest";
  userId?: string; // Used to query MongoDB User model
  ipAddress?: string;
}

const GUEST_ROOM_LIMIT = 1;
const AUTH_ROOM_LIMIT = 5;

export const enforceRoomLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { userType, userId, ipAddress } = req;

  try {
    if (userType === "authenticated") {
      if (!userId) return res.status(400).json({ message: "UID not provided" });

      // Fetch MongoDB user by Firebase UID (assumes UID is used as _id or linked field)
      const user = await User.findOne({ firebaseUid: userId }).populate("rooms");

      if (!user) return res.status(404).json({ message: "User not found" });

      const activeRooms = (user.rooms as mongoose.Types.DocumentArray<any>).filter(
        (room: any) => room.isActive
      );

      if (activeRooms.length >= AUTH_ROOM_LIMIT) {
        return res.status(403).json({ message: "You have reached the room limit (5)." });
      }
    } else if (userType === "guest") {
      if (!ipAddress) return res.status(400).json({ message: "IP address not available" });

      const guestRooms = await Room.find({ createdByIp: ipAddress, isGuest: true });

      if (guestRooms.length >= GUEST_ROOM_LIMIT) {
        return res.status(403).json({ message: "Guests can only create 1 room." });
      }
    }

    next();
  } catch (err) {
    console.error("Room limit check failed:", err);
    return res.status(500).json({ message: "Room limit check failed", error: err });
  }
};
