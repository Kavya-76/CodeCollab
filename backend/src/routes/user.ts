import express from "express";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/:uid", async (req, res) => {
  const uid = req.params.uid;

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
});

export default router;
