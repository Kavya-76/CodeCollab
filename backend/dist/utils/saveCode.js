var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { User } from "../models/User";
export const saveCodeForUser = (uid, code, language) => __awaiter(void 0, void 0, void 0, function* () {
    if (!uid || !code)
        return;
    try {
        let user = yield User.findOne({ uid });
        if (!user) {
            console.warn(`User with UID ${uid} not found. Skipping save.`);
            return;
        }
        // Ensure max 5 code history
        if (user.savedCodes.length >= 5) {
            user.savedCodes.shift(); // remove the oldest
        }
        user.savedCodes.push({
            language,
            content: code,
            savedAt: new Date(),
        });
        yield user.save();
        console.log(`✅ Code saved for user ${uid}`);
    }
    catch (err) {
        console.error(`❌ Failed to save code for user ${uid}:`, err);
    }
});
