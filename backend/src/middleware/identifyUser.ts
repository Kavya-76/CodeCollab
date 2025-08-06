import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../types";
import admin from "../firebase/firebaseAdmin.js";

export const identifyUser: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
  next
) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      req.userType = "authenticated";
      req.userId = decodedToken.uid;
      console.log("Authenticated user: ",req.userId);
      return next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  }
  const guestId = req.headers["x-guest-id"];
  if (typeof guestId !== "string" || !guestId) {
    res.status(400).json({ message: "Missing guest identifier" });
    return;
  }

  req.userType = "guest";
  req.userId = guestId;

  console.log("Guest user:", guestId);

  next();
};
