import React from "react";

export default function Settings({ setDisplay, dispatchGameState, gameState }) {
  function handleNewGame(event) {
    event.preventDefault();
    const newNumLetters = event.target.elements.numLetters.value;
    const newIndicateValidity = event.target.elements.indicateValidity.checked;

    dispatchGameState({
      action: "newGame",
      numLetters: newNumLetters,
      indicateValidity: newIndicateValidity,
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

        <div className="setting">
          <div className="setting-description">
            <label htmlFor="indicateValidity">Indicate validity</label>
            <div className="setting-info">
              Indicate whether letters form a valid word
            </div>
          </div>
          <input
            id="indicateValidity"
            type="checkbox"
            defaultChecked={gameState.indicateValidity}
            onChange={() => dispatchGameState({action: "changeIndicateValidity"})}
          />
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
          Return
        </button>
      </div>
    </form>
  );
}
