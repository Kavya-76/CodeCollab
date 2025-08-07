import { User } from "../models/User";

export const saveCodeForUser = async (
  uid: string,
  code: string,
  language: string
): Promise<void> => {
  if (!uid || !code) return;

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      console.warn(`User with UID ${uid} not found. Skipping save.`);
      return;
    }

    // Ensure max 5 code history
    if (user.rooms.size >= 5) {
      // user.savedCodes.shift(); // remove the oldest
    }

    // user.rooms.set(roomI{
    //   language,
    //   content: code,
    //   savedAt: new Date(),
    // });

    await user.save();
    console.log(`✅ Code saved for user ${uid}`);
  } catch (err) {
    console.error(`❌ Failed to save code for user ${uid}:`, err);
  }
};
