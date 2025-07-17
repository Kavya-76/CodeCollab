import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../types";

export const identifyUser: RequestHandler = (req, res, next) => {
  const typedReq = req as AuthenticatedRequest;
  const user = typedReq.user;

  if (user?.uid) {
    typedReq.userType = "authenticated";
    typedReq.userId = user.uid;
  } else {
    typedReq.userType = "guest";
    typedReq.ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }

  next();
};