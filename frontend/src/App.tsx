import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import Home from "./pages/Home.js";
import Room from "./pages/Room.js";
import Login from "./pages/Login.js";
import Dashboard from "./pages/Dashboard.js";
import Code from "./pages/Code.js";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/room/:roomId" element={<Room />}></Route>
          <Route path="/code/:codeId" element={<Code />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
