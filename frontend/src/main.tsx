import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.tsx";
import Home from "./components/Home.tsx";
import Packets from "./components/Packets.tsx";
import Claim from "./components/Claim.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="packets" element={<Packets />} />
          <Route path="claim" element={<Claim />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
