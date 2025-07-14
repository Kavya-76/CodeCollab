// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAR9VDAIJo1cciwNrT8y2-R7KWZj-10J60",
  authDomain: "codecollab-285e0.firebaseapp.com",
  projectId: "codecollab-285e0",
  storageBucket: "codecollab-285e0.appspot.com",
  messagingSenderId: "262967529105",
  appId: "1:262967529105:web:0f8b6a283ee826ac937930",
  measurementId: "G-XE1D2T61F5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
