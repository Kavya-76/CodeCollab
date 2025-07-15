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
import { signupOrUpdateUser } from "../utils/signup.js";
const router = express.Router();
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = req.body;
        yield signupOrUpdateUser(userInfo);
        res.status(200).json({ message: "User registered/updated" });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
}));
export default router;
