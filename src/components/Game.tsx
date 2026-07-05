import Pool from "./Pool";
import Result from "./Result";
import Board from "./Board";
import DragGroup from "./DragGroup";
import type {GameReducerPayload} from "../logic/gameReducer";
import type {CSSPropertiesWithVars, DisplayState, GameState} from "../Types";

export default function Game({
  dispatchGameState,
  gameState,
  setDisplay,
  validityOpacity,
}: {
  dispatchGameState: React.Dispatch<GameReducerPayload>;
  gameState: GameState;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
  validityOpacity: number;
}): React.JSX.Element {
  // dragCount ensures a different key each time, so a fresh DragGroup is mounted even if there's
  // no render between one drag ending and the next one starting.
  const dragGroup = gameState.dragState ? (
    <DragGroup
      key={gameState.dragCount}
      dispatchGameState={dispatchGameState}
      dragState={gameState.dragState}
      pieces={gameState.pieces}
      gridSize={gameState.gridSize}
    />
  ) : null;
  return (
    <div
      id="game"
      style={
        {
          "--grid-rows": gameState.gridSize,
          "--grid-columns": gameState.gridSize,
          "--validity-opacity": validityOpacity,
        } as CSSPropertiesWithVars
      }
    >
      <Board
        pieces={gameState.pieces}
        gridSize={gameState.gridSize}
        {...(gameState.dragState && {
          dragPieceIDs: gameState.dragState.pieceIDs,
        })}
        {...(gameState.dragState && {
          dragDestination: gameState.dragState.destination,
        })}
        gameIsSolved={gameState.gameIsSolved}
        dispatchGameState={dispatchGameState}
        indicateValidity={validityOpacity > 0}
      ></Board>
      {gameState.allPiecesAreUsed ? (
        <Result
          dispatchGameState={dispatchGameState}
          gameState={gameState}
          setDisplay={setDisplay}
        ></Result>
      ) : (
        <Pool
          pieces={gameState.pieces}
          {...(gameState.dragState && {
            dragDestination: gameState.dragState.destination,
          })}
          dispatchGameState={dispatchGameState}
        ></Pool>
      )}
      {dragGroup}
    </div>
  );
}
