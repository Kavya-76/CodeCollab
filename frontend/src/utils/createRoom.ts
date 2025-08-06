import axios from "axios";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

export const createRoom = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const headers: Record<string, string> = {};

  if (user) {
    try {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Error getting ID token:", error);
    }
  } else {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = uuidv4();
      localStorage.setItem("guestId", guestId);
    }
    headers["x-guest-id"] = guestId;
  }

  const response = await axios.post(
    "http://localhost:5000/api/room/create",
    {},
    { headers }
  );

  return {
    userId: response.data.uid,
    roomId: response.data.roomId,
  };
};
