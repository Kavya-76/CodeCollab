import { Request, Response, NextFunction } from "express";
import { DecodedIdToken } from "firebase-admin/auth";

interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
  userType: string;
  userId: string;
  ipAddress?: string | string[] | undefined;
}

export const identifyUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user; // From auth middleware (JWT or session)

  if (user && user.uid) {
    req.userType = "authenticated";
    req.userId = user.uid;
  } else {
    req.userType = "guest";
    req.ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }

  next();
};
