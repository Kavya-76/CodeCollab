import { User } from "../models/User.js";

interface FirebaseUserInfo {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: string;
}

export const signupOrUpdateUser = async (user: FirebaseUserInfo) => {
  if (!user?.uid) return;

  try {
    let existingUser = await User.findOne({ uid: user.uid });

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

      await newUser.save();
      console.log(`✅ New user created: ${user.displayName} (${user.uid})`);
    } else {
      // Update existing user's details
      existingUser.displayName = user.displayName;
      existingUser.email = user.email;
      existingUser.photoURL = user.photoURL;
      existingUser.provider = user.provider;
      await existingUser.save();
      console.log(`🔄 User updated: ${user.displayName} (${user.uid})`);
    }
  } catch (err) {
    console.error("❌ Error during user signup/update:", err);
  }
};
