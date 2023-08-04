import React from "react";
import GameOver from "./GameOver";

export default function Result({ dropToken, dispatchGameState, gameState }) {
  return (
    <div
      id="result"
      onDrop={(event) => dropToken({ event: event })}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragEnter={(event) => {
        event.preventDefault();
      }}
    >
      {gameState.gameIsSolved ? (
        <GameOver
          dispatchGameState={dispatchGameState}
          gameState={gameState}
        ></GameOver>
      ) : (
        gameState.gameIsSolvedReason
      )}
    </div>
  );
}
