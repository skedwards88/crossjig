import type {GameReducerPayload} from "../logic/gameReducer";
import type {DisplayState, GameState} from "../Types";
import GameOver from "./GameOver";

export default function Result({
  dispatchGameState,
  gameState,
  setDisplay,
}: {
  dispatchGameState: React.Dispatch<GameReducerPayload>;
  gameState: GameState;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
}): React.JSX.Element {
  return (
    <div id="result">
      {gameState.gameIsSolved ? (
        <GameOver
          dispatchGameState={dispatchGameState}
          gameState={gameState}
          setDisplay={setDisplay}
        ></GameOver>
      ) : (
        gameState.gameIsSolvedReason
      )}
    </div>
  );
}
