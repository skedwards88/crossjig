import React from "react";
import Piece from "./Piece";
import DragShadow from "./DragShadow";

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

  let dragShadow;
  if (dragDestination?.where === "board") {
    const draggedPieces = pieces.filter((piece) =>
      dragPieceIDs.includes(piece.id)
    );
    const grid = countingGrid(gridSize, draggedPieces);
    dragShadow = (
      <DragShadow
        grid={grid}
        top={dragDestination.top}
        left={dragDestination.left}
      />
    );
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
      {dragShadow}
    </div>
  );
}
