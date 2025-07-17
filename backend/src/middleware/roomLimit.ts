import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { Room } from "../models/Room";
import { User } from "../models/User";
import mongoose from "mongoose";

const GUEST_ROOM_LIMIT = 1;
const AUTH_ROOM_LIMIT = 5;

export const enforceRoomLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const typedReq = req as AuthenticatedRequest;
  const { userType, userId, ipAddress } = typedReq;

  try {
    if (userType === "authenticated") {
      if (!userId) {
        res.status(400).json({ message: "UID not provided" });
        return;
      }

      const user = await User.findOne({ firebaseUid: userId }).populate("rooms");

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const activeRooms = (user.rooms as mongoose.Types.DocumentArray<any>).filter(
        (room: any) => room.isActive
      );

      if (activeRooms.length >= AUTH_ROOM_LIMIT) {
        res.status(403).json({ message: "You have reached the room limit (5)." });
        return;
      }

    } else if (userType === "guest") {
      if (!ipAddress) {
        res.status(400).json({ message: "IP address not available" });
        return;
      }

      const guestRooms = await Room.find({
        createdByIp: ipAddress,
        isGuest: true,
      });

      if (guestRooms.length >= GUEST_ROOM_LIMIT) {
        res.status(403).json({ message: "Guests can only create 1 room." });
        return;
      }
    }

    next();
  } catch (err) {
    console.error("Room limit check failed:", err);
    res.status(500).json({ message: "Room limit check failed", error: err });
  }
};