import React from "react";
import packageJson from "../../package.json";
import {handleShare} from "../common/handleShare";
import {handleInstall} from "../common/handleInstall";

export default function ExtendedMenu({
  setDisplay,
  setInstallPromptEvent,
  showInstallButton,
  installPromptEvent,
}) {
  return (
    <div className="App" id="extendedMenu">
      <h1>Crossjig</h1>
      <button onClick={() => setDisplay("rules")}>
        <div id="rulesIcon" className="extendedMenuIcon"></div>
        <span>How to play</span>
      </button>

      <button onClick={() => setDisplay("custom")}>
        <div id="customIcon" className="extendedMenuIcon"></div>
        <span>Create a custom crossjig</span>
      </button>

      <button onClick={() => setDisplay("settings")}>
        <div id="settingsIcon" className="extendedMenuIcon"></div>
        <span>Settings</span>
      </button>

      {navigator.canShare ? (
        <button
          onClick={() =>
            handleShare({
              appName: "Crossjig",
              text: "Check out this word game!",
              url: "https://crossjig.com",
            })
          }
        >
          <div id="shareIcon" className="extendedMenuIcon"></div>
          <span>Share</span>
        </button>
      ) : (
        <></>
      )}

      {showInstallButton && installPromptEvent ? (
        <button
          onClick={() =>
            handleInstall(installPromptEvent, setInstallPromptEvent)
          }
        >
          <div id="installIcon" className="extendedMenuIcon"></div>
          <span>{"Install (offline play and easy access)"}</span>
        </button>
      ) : (
        <button onClick={() => setDisplay("fallbackInstall")}>
          <div id="installIcon" className="extendedMenuIcon"></div>
          <span>{"Install (play offline)"}</span>
        </button>
      )}

      <button onClick={() => setDisplay("moreGames")}>
        <div id="heartIcon" className="extendedMenuIcon"></div>
        <span>More games like this</span>
      </button>

      <button onClick={() => setDisplay("heart")}>
        <div id="infoIcon" className="extendedMenuIcon"></div>
        <span>Info and feedback</span>
      </button>

      <button onClick={() => setDisplay("game")}>
        <div id="backIcon" className="extendedMenuIcon"></div>
        <span>Return to game</span>
      </button>
      <small id="version">version {packageJson.version}</small>
    </div>
  );
}
