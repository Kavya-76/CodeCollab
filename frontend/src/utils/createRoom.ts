import axios from "axios";
import { getAuth } from "firebase/auth";

export const createRoom = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  let headers = {};

  if (user) {
    try {
      const token = await user.getIdToken();
      headers = {
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      console.error("Error getting ID token:", error);
    }
  }

  const response = await axios.post("http://localhost:5000/api/room/create", {}, { headers });
  return response.data.roomId;
};
