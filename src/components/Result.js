import React from "react";
import { crosswordValidQ } from "@skedwards88/word_logic";

import GameOver from "./GameOver";

function piecesOverlapQ(boardPieces, gridSize) {
  let overlappingPiecesQ = false;

  let grid = JSON.parse(
    JSON.stringify(Array(gridSize).fill(Array(gridSize).fill("")))
  );

  for (let index = 0; index < boardPieces.length; index++) {
    const letters = boardPieces[index].letters;
    let top = boardPieces[index].boardTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = boardPieces[index].boardLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        if (letters[rowIndex][colIndex]) {
          if (grid[top][left]) {
            overlappingPiecesQ = true;
            break;
          }
          grid[top][left] = letters[rowIndex][colIndex];
        }
        left += 1;
      }
      if (overlappingPiecesQ) {
        break;
      }
      top += 1;
    }
    if (overlappingPiecesQ) {
      break;
    }
  }
  return { piecesOverlap: overlappingPiecesQ, grid: grid };
}

function gameSolvedQ(pieces, gridSize) {
  const boardPieces = pieces.filter(
    (piece) => piece.boardTop >= 0 && piece.boardLeft >= 0
  );

  const { piecesOverlap, grid } = piecesOverlapQ(boardPieces, gridSize);
  if (piecesOverlap) {
    return {
      gameIsSolved: false,
      reason: `No letters may overlap`,
    };
  }

  const { gameIsSolved, reason } = crosswordValidQ({ grid: grid });
  return {
    gameIsSolved: gameIsSolved,
    reason: reason,
  };
}

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
