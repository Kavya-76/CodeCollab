import express, { Request, Response } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { User } from "../models/User.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
}

const router = express.Router();

router.get(
  "/getInfo", verifyFirebaseToken,
  async (req: AuthenticatedRequest, res: Response) => {
    console.log(req.user);
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

export default router;
