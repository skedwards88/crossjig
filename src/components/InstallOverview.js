import React from "react";
import GooglePlayStore from "./GooglePlayStore";
import AppleStore from "./AppleStore";
import {handleInstall} from "../common/handleInstall";

export default function InstallOverview({
  setDisplay,
  setInstallPromptEvent,
  showInstallButton,
  installPromptEvent,
}) {
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
            onClick={
              showInstallButton && installPromptEvent
                ? () => handleInstall(installPromptEvent, setInstallPromptEvent)
                : () => setDisplay("pwaInstall")
            }
            aria-label="Install from your browser"
          ></button>
        </div>
      </div>
      <button className="close" onClick={() => setDisplay("game")}>
        Close
      </button>
    </div>
  );
}
