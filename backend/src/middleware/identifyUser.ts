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
    console.log("Authenticated user");
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      req.userType = "authenticated";
      req.userId = decodedToken.uid;
      return next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  }
  console.log("guest user");
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    "";

  req.userType = "guest";
  req.userId = ip;

  next();
};
