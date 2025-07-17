import mongoose from "mongoose";

const roomSnapshotSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  isActive: {type: Boolean, required: true},
  adminName: { type: String, required: true },
  language: { type: String, default: "javascript" },
  code: { type: String, default: "" },
  collaborators: { type: [String], default: [] },
  joinedAt: { type: Date, required: true },
  leftAt: { type: Date, required: true },
});

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String, required: true },
  photoURL: { type: String },
  provider: { type: String, required: true }, 
  rooms: {
    type: [roomSnapshotSchema],
    default: [],
    validate: [arrayLimit, "User can save max 5 rooms"],
  },
});

function arrayLimit(val: any[]) {
  return val.length <= 5;
}

export const User = mongoose.model("User", userSchema);
