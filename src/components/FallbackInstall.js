import React from "react";
import GooglePlayStore from "./GooglePlayStore";
import AppleStore from "./AppleStore";

export default function FallbackInstall({setDisplay}) {
  return (
    <div className="App info">
      <div className="infoText">
        <p>Install for easy access and offline play</p>

        <div className="appStoreButtons">
          <GooglePlayStore />

          <AppleStore />

          <button
            className="appStoreButton"
            id="pwa"
            onClick={() => setDisplay("pwaInstall")}
          >
            Install from your browser
          </button>
        </div>
      </div>
      <button className="close" onClick={() => setDisplay("game")}>
        Close
      </button>
    </div>
  );
}
