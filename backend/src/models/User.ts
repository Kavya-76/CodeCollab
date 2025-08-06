import mongoose from "mongoose";

interface RoomSnapshot {
  roomId: string;
  code: string;
  language: string;
  joinedAt: Date;
  leftAt: Date;
}

const roomSnapshotSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  language: { type: String, default: "javascript" },
  code: { type: String, default: "" },
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
    type: Map,
    of: roomSnapshotSchema,
    default: () => new Map<string, RoomSnapshot>(),
    validate: {
      validator: function (value: Map<string, RoomSnapshot>) {
        return value.size <= 5;
      },
      message: "User can save max 5 rooms",
    },
  },
});

export const User = mongoose.model("User", userSchema);
