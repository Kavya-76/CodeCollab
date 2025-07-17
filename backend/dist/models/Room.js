import mongoose from "mongoose";
const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    adminId: { type: String, default: null },
    code: { type: String, default: "" },
    language: { type: String, default: "javascript" },
    members: [
        {
            uid: String,
            joinedAt: Date,
        },
    ],
    createdAt: { type: Date, default: Date.now },
});
export const Room = mongoose.model("Room", roomSchema);
