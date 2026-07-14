import type {GameReducerPayload} from "../logic/gameReducer";
import type {CSSPropertiesWithVars, DisplayState, GameState} from "../Types";

export default function Settings({
  setDisplay,
  dispatchGameState,
  gameState,
  setValidityOpacity,
  originalValidityOpacity,
}: {
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
  dispatchGameState: React.Dispatch<GameReducerPayload>;
  gameState: GameState;
  setValidityOpacity: React.Dispatch<React.SetStateAction<number>>;
  originalValidityOpacity: number;
}): React.JSX.Element {
  function handleNewGame(event: React.SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    const newNumLetters = parseInt(
      event.currentTarget.elements.numLetters.value,
    );
    const newValidityOpacity =
      event.currentTarget.elements.validityOpacity.value / 100;

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
              -
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
              style={
                {
                  "--validity-opacity": originalValidityOpacity,
                } as CSSPropertiesWithVars
              }
            >
              EXAMPLE
            </div>
          </div>
          <div id="validityOpacity-container">
            <div id="validityOpacity-info" className="setting-info">
              -
            </div>
            <input
              id="validityOpacity"
              className="validityOpacity"
              type="range"
              min={0}
              max={100}
              defaultValue={originalValidityOpacity * 100 || 15}
              onChange={(event) => {
                const newValidityOpacity =
                  parseInt(event.currentTarget.value) / 100;
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
