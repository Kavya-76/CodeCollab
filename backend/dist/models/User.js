import mongoose from "mongoose";
const savedCodeSchema = new mongoose.Schema({
    language: { type: String, default: "javascript" },
    content: { type: String, required: true },
    savedAt: { type: Date, default: Date.now },
});
const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: String,
    displayName: String,
    photoURL: String,
    provider: String,
    savedCodes: {
        type: [savedCodeSchema],
        default: [],
    },
});
export const User = mongoose.model("User", userSchema);
