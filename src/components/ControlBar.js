import React from "react";

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
      <button
        id="settingsIcon"
        className="controlButton"
        onClick={() => setDisplay("settings")}
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
        id="menuIcon"
        className="controlButton"
        onClick={() => setDisplay("extendedMenu")}
      ></button>
    </div>
  );
}

export default ControlBar;
