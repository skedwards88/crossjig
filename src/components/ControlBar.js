import React from "react";
import { handleInstall } from "../common/handleInstall";

function ControlBar({dispatchGameState, gameState, setDisplay, setInstallPromptEvent, showInstallButton,installPromptEvent}) {

  return (
      <div id="controls">
        <button
          id="newGameButton"
          onClick={() => {
            dispatchGameState({
              ...gameState,
              action: "newGame",
            });
          }}
        ></button>
        <button
          id="helpButton"
          // disabled={!gameState.pool.length} todo
          onClick={() => dispatchGameState({ action: "getHint" })}
        ></button>
        <button id="settingsButton" onClick={() => setDisplay("settings")}></button>
        <button id="rulesButton" onClick={() => setDisplay("rules")}></button>
        <button id="heartButton" onClick={() => setDisplay("heart")}></button>
        {showInstallButton && installPromptEvent ? (
          <button
            id="installButton"
            onClick={() =>
              handleInstall(installPromptEvent, setInstallPromptEvent)
            }
          ></button>
        ) : (
          <></>
        )}
      </div>
  );
}

export default ControlBar;
