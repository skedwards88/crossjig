import React from "react";
import Pool from "./Pool";
import Result from "./Result";
import Board from "./Board";
import DragGroup from "./DragGroup";

function Game({dispatchGameState, gameState, setDisplay}) {
  // dragCount ensures a different key each time, so a fresh DragGroup is mounted even if there's
  // no render between one drag ending and the next one starting.
  const dragGroup = gameState.dragState ? (
    <DragGroup
      key={gameState.dragCount}
      dispatchGameState={dispatchGameState}
      gameState={gameState}
    />
  ) : null;
  return (
    <div
      id="game"
      style={{
        "--grid-rows": gameState.gridSize,
        "--grid-columns": gameState.gridSize,
        "--validity-opacity": gameState.validityOpacity,
      }}
    >
      <Board
        pieces={gameState.pieces}
        gridSize={gameState.gridSize}
        dragPieceIDs={gameState.dragState?.pieceIDs}
        dragDestination={gameState.dragState?.destination}
        gameIsSolved={gameState.gameIsSolved}
        dispatchGameState={dispatchGameState}
        indicateValidity={gameState.validityOpacity > 0}
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
          dragDestination={gameState.dragState?.destination}
          dispatchGameState={dispatchGameState}
        ></Pool>
      )}
      {dragGroup}
    </div>
  );
}

export default Game;
