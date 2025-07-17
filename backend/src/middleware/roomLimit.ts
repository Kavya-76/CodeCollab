import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { Room } from "../models/Room.js";

const GUEST_ROOM_LIMIT = 1;
const AUTH_ROOM_LIMIT = 5;

export const enforceRoomLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userType, userId } = req;

  if (!userId) {
    res.status(400).json({ message: "User ID not provided" });
    return;
  }

  try {
    // Count rooms where this user is the admin (i.e., created them)
    const roomCount = await Room.countDocuments({ adminId: userId });

    if (
      (userType === "authenticated" && roomCount >= AUTH_ROOM_LIMIT) ||
      (userType === "guest" && roomCount >= GUEST_ROOM_LIMIT)
    ) {
      const message =
        userType === "authenticated"
          ? "You have reached the room limit (5)."
          : "Guests can only create 1 room.";
      res.status(403).json({ message });
      return;
    }

    next();
  } catch (err) {
    console.error("Room limit check failed:", err);
    res.status(500).json({ message: "Room limit check failed", error: err });
  }
};
