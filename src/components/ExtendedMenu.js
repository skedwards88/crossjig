import React from "react";
import packageJson from "../../package.json";
import {handleShare} from "../common/handleShare";

export default function ExtendedMenu({setDisplay}) {
  return (
    <div className="App" id="extendedMenu">
      <button onClick={() => setDisplay("rules")}>
        <div id="rulesButton" className="extendedMenuIcon"></div>
        <span>How to play</span>
      </button>

      <button onClick={() => setDisplay("custom")}>
        <div id="customButton" className="extendedMenuIcon"></div>
        <span>Create a custom crossjig</span>
      </button>

      {!navigator.canShare ? (
        <button
          onClick={() => handleShare({appName: "Crossjig", text, url, seed})}
        >
          <div id="shareButton" className="extendedMenuIcon"></div>
          <span>Share</span>
        </button>
      ) : (
        <></>
      )}

      <button>
        <div id="installButton" className="extendedMenuIcon"></div>
        <span>Install</span>
      </button>

      <button onClick={() => setDisplay("moreGames")}>
        <div id="moreButton" className="extendedMenuIcon"></div>
        <span>More games like this</span>
      </button>

      <button>
        <div id="heartButton" className="extendedMenuIcon"></div>
        <span>Acknowledgements</span>
      </button>

      <button>
        <div id="backButton" className="extendedMenuIcon"></div>
        <span>Return to game</span>
      </button>
      <small id="version">version {packageJson.version}</small>
    </div>
  );
}
