import React from "react";
import Piece from "./Piece";

function countingGrid(gridSize, pieces) {
  console.log("countingGrid", pieces);
  let grid = Array(gridSize)
    .fill(undefined)
    .map(() => Array(gridSize).fill(0));

  for (let piece of pieces) {
    const letters = piece.letters;
    let top = piece.boardTop ?? piece.groupTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = piece.boardLeft ?? piece.groupLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        let letter = letters[rowIndex][colIndex];
        if (letter) {
          grid[top][left]++;
        }
        left++;
      }
      top++;
    }
  }
  return grid;
}

function PlaceholderBox({ rowIndex, colIndex }) {
  return (
    <div
      className="placeholder"
      style={{
        gridRow: rowIndex + 1, // CSS grid coordinates are 1-based
        gridColumn: colIndex + 1,
      }}
    />
  );
}

export default function Board({
  pieces,
  gridSize,
  dragPieceIDs,
  dragDestination,
  gameIsSolved,
  dispatchGameState,
}) {
  const boardPieces = pieces.filter(
    (piece) => piece.boardTop >= 0 && piece.boardLeft >= 0
  );

  const overlapGrid = countingGrid(gridSize, boardPieces);
  let pieceElements = boardPieces.map((piece) => (
    <Piece
      key={piece.id}
      piece={piece}
      where="board"
      overlapGrid={overlapGrid}
      gameIsSolved={gameIsSolved}
      dispatchGameState={dispatchGameState}
    />
  ));

  let placeholders = [];
  if (dragDestination?.where === "board") {
    const draggedPieces = pieces.filter((piece) =>
      dragPieceIDs.includes(piece.id)
    );
    const grid = countingGrid(gridSize, draggedPieces);
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      for (let colIndex = 0; colIndex < grid[0].length; colIndex++) {
        if (grid[rowIndex][colIndex] > 0) {
          placeholders.push(
            <PlaceholderBox
              key={`placeholder-${rowIndex}-${colIndex}`}
              rowIndex={dragDestination.top + rowIndex}
              colIndex={dragDestination.left + colIndex}
            />
          );
        }
      }
    }
  }

  return (
    <div
      id="board"
      onPointerDown={(event) => {
        event.preventDefault();
        dispatchGameState({
          action: "shiftStart",
          pointer: { x: event.clientX, y: event.clientY },
        });
      }}
    >
      {pieceElements}
      {placeholders}
    </div>
  );
}
