var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { User } from "../models/User.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
const router = express.Router();
router.get("/getInfo", verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const uid = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        res.status(400).json({ message: "UID is required" });
        return;
    }
    try {
        const user = yield User.findOne({ uid }).select("-__v -_id");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error("Error fetching user info:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}));
export default router;
