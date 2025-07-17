var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import admin from "../firebase/firebaseAdmin.js";
export const identifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers.authorization;
    if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        console.log("Authenticated user");
        try {
            const decodedToken = yield admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            req.userType = "authenticated";
            req.userId = decodedToken.uid;
            return next();
        }
        catch (error) {
            console.error("Token verification failed:", error);
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }
    }
    console.log("guest user");
    const ip = ((_a = req.headers["x-forwarded-for"]) === null || _a === void 0 ? void 0 : _a.split(",")[0]) ||
        req.socket.remoteAddress ||
        "";
    req.userType = "guest";
    req.userId = ip;
    next();
});
