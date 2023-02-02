import React from "react";

export default function Settings({ setDisplay, dispatchGameState, gameState }) {
  function handleNewGame(event) {
    event.preventDefault();
    const newNumLetters = event.target.elements.numLetters.value;

    dispatchGameState({
      action: "newGame",
      numLetters: newNumLetters,
    });
    setDisplay("game");
  }

  return (
    <form className="App settings" onSubmit={(e) => handleNewGame(e)}>
      <div id="settings">
        <div className="setting">
          <div className="setting-description">
            <label htmlFor="numLetters">Number of pieces</label>
          </div>
          <div id="numLetters-container">
            <div id="numLetters-info" className="setting-info">
              –
            </div>
            <input
              id="numLetters"
              className="numLetters"
              type="range"
              min="20"
              max="60"
              defaultValue={gameState.numLetters || "30"}
            />
            <div id="numLetters-info" className="setting-info">
              +
            </div>
          </div>
        </div>
      </div>
      <div id="setting-buttons">
        <button type="submit" aria-label="new game">
          New game
        </button>
        <button
          type="button"
          aria-label="cancel"
          onClick={() => setDisplay("game")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
