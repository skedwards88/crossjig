import React from "react";

export default function Settings({
  setDisplay,
  dispatchGameState,
  gameState,
  setValidityOpacity,
  originalValidityOpacity,
}) {
  function handleNewGame(event) {
    event.preventDefault();
    const newNumLetters = event.target.elements.numLetters.value;
    const newValidityOpacity =
      event.target.elements.validityOpacity.value / 100;

    setValidityOpacity(newValidityOpacity);

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

        <div className="setting">
          <div className="setting-description">
            <label htmlFor="validityOpacity">Validity indication</label>
            <div className="setting-info">{`Valid words are indicated with a strikethrough. This controls the brightness of the strikethrough.`}</div>
            <div
              id="validity-example"
              style={{"--validity-opacity": originalValidityOpacity}}
            >
              EXAMPLE
            </div>
          </div>
          <div id="validityOpacity-container">
            <div id="validityOpacity-info" className="setting-info">
              –
            </div>
            <input
              id="validityOpacity"
              className="validityOpacity"
              type="range"
              min={0}
              max={100}
              defaultValue={originalValidityOpacity * 100 || 15}
              onChange={(event) => {
                const newValidityOpacity = event.target.value / 100;
                setValidityOpacity(newValidityOpacity);
              }}
            />
            <div id="validityOpacity-info" className="setting-info">
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
          Return
        </button>
      </div>
    </form>
  );
}
