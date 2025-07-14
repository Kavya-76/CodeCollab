import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import Home from "./pages/Home.js";
import Room from "./pages/Room.js";
import Login from "./pages/Login.js";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/room/:roomId" element={<Room />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
