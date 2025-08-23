import React from "react";
import Share from "@skedwards88/shared-components/src/components/Share";

function ControlBar({dispatchGameState, gameState, setDisplay, dailyIsSolved}) {
  return (
    <div id="controls">
      <button
        id="newGameIcon"
        className="controlButton"
        onClick={() => {
          dispatchGameState({
            ...gameState,
            action: "newGame",
          });
        }}
      ></button>

      <button
        id="hintIcon"
        className="controlButton"
        disabled={gameState.gameIsSolved}
        onClick={() => dispatchGameState({action: "getHint"})}
      ></button>

      {dailyIsSolved ? (
        <button
          id="calendarIconSolved"
          className="controlButton"
          onClick={() => {
            dispatchGameState({action: "clearStreakIfNeeded"});
            setDisplay("daily");
          }}
        ></button>
      ) : (
        <button
          id="calendarIcon"
          className="controlButton"
          onClick={() => setDisplay("daily")}
        ></button>
      )}

      <button
        id="settingsIcon"
        className="controlButton"
        onClick={() => setDisplay("settings")}
      ></button>

      <button
        id="heartIcon"
        className="controlButton"
        onClick={() => setDisplay("moreGames")}
      ></button>

      <Share
        appName="Crossjig"
        text="Check out this word puzzle!"
        url="https://crossjig.com"
        origin="control bar"
        id="shareIcon"
        className="controlButton"
      ></Share>

      <button
        id="menuIcon"
        className="controlButton"
        onClick={() => setDisplay("extendedMenu")}
      ></button>
    </div>
  );
}

export default ControlBar;
