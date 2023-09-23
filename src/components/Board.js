import React from "react";
import Piece from "./Piece";

function countingGrid(gridSize, boardPieces) {
  let grid = Array(gridSize)
    .fill(undefined)
    .map(() => Array(gridSize).fill(0));

  for (let index = 0; index < boardPieces.length; index++) {
    const letters = boardPieces[index].letters;
    let top = boardPieces[index].boardTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = boardPieces[index].boardLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        let letter = letters[rowIndex][colIndex];
        if (letter) {
          grid[top][left]++;
        }
        left += 1;
      }
      top += 1;
    }
  }
  return grid;
}

export default function Board({
  pieces,
  gridSize,
  gameIsSolved,
  dispatchGameState,
}) {
  const boardPieces = pieces.filter(
    (piece) => piece.boardTop >= 0 && piece.boardLeft >= 0
  );

  const overlapGrid = countingGrid(gridSize, boardPieces);
  let dragController = { dispatchGameState };
  let pieceElements = boardPieces.map((piece) => (
    <Piece
      key={piece.id}
      piece={piece}
      where="board"
      overlapGrid={overlapGrid}
      gameIsSolved={gameIsSolved}
      dragController={dragController}
    />
  ));

  return (
    <div id="board"
      onPointerDown={(event) => {
        event.preventDefault();
        dispatchGameState({action: "shiftStart", pointer: {x: event.clientX, y: event.clientY}});
      }}
    >
      {pieceElements}
    </div>
  );
}
