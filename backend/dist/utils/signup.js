var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { User } from "../models/User.js";
export const signupOrUpdateUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(user === null || user === void 0 ? void 0 : user.uid))
        return;
    try {
        let existingUser = yield User.findOne({ uid: user.uid });
        if (!existingUser) {
            // Create new user
            const newUser = new User({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                provider: user.provider,
                savedCodes: [],
            });
            yield newUser.save();
            console.log(`✅ New user created: ${user.displayName} (${user.uid})`);
        }
        else {
            // Update existing user's details
            existingUser.displayName = user.displayName;
            existingUser.email = user.email;
            existingUser.photoURL = user.photoURL;
            existingUser.provider = user.provider;
            yield existingUser.save();
            console.log(`🔄 User updated: ${user.displayName} (${user.uid})`);
        }
    }
    catch (err) {
        console.error("❌ Error during user signup/update:", err);
    }
});
