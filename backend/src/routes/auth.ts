import express from "express";
import { signupOrUpdateUser } from "../utils/signup.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const userInfo = req.body;
    await signupOrUpdateUser(userInfo);
    res.status(200).json({ message: "User registered/updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

export default router;
