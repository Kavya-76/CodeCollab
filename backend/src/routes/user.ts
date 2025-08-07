import express, { Request, Response } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { User } from "../models/User.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
}

const router = express.Router();

router.get(
  "/getInfo",
  verifyFirebaseToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const uid = req.user?.uid;

    if (!uid) {
      res.status(400).json({ message: "UID is required" });
      return;
    }

    try {
      const user = await User.findOne({ uid }).select("-__v -_id");
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (err) {
      console.error("Error fetching user info:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.put("/updateDisplayName", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid;
  const {displayName} = req.body;

  if (!uid) {
    res.status(400).json({ message: "UID is required" });
    return;
  }

  if (!displayName || typeof displayName !== "string" || !displayName.trim()) {
    res.status(400).json({ message: "Valid username is required" });
    return;
  }

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.displayName = displayName.trim();
    await user.save();

    res.status(200).json({"message": "Display name updated successfully"})

    // logic to update the username
  } catch (err) {
    console.error("Error updating the display name: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
