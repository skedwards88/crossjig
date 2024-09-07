import {createRoot} from "react-dom/client";
import React from "react";
import App from "./components/App";
import "./styles/App.css";
import "./styles/ControlBar.css";
import "./styles/Settings.css";
import "./styles/Rules.css";
import "./styles/Stats.css";
import "./styles/MoreGames.css";
import "./styles/LargeScreen.css";

if (process.env.NODE_ENV !== "development" && "serviceWorker" in navigator) {
  const path = "/service-worker.js";
  const scope = "";
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(path, {scope: scope})
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
