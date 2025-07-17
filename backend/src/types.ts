import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";

export interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
  userType?: "authenticated" | "guest";
  userId?: string;
  ipAddress?: string | string[] | undefined;
}