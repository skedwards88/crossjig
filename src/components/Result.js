import React from "react";
import GameOver from "./GameOver";
import { gameSolvedQ } from "../logic/gameSolvedQ";

export default function Result({ dropToken, dispatchGameState, gameState }) {
  const pieces = gameState.pieces;
  const gridSize = gameState.gridSize;

  const { gameIsSolved, reason } = gameSolvedQ(pieces, gridSize);

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
      {gameIsSolved ? (
        <GameOver
          dispatchGameState={dispatchGameState}
          gameState={gameState}
        ></GameOver>
      ) : (
        reason
      )}
    </div>
  );
}
