// todo wip new, incomplete file

import React from "react";
import Piece from "./Piece";
import DragShadow from "./DragShadow";
import {countingGrid} from "./Board";

export default function CustomBoard({
  customState,
  dispatchGameState,
  dragDestination,
  dragPieceIDs
}) {

  const boardPieces = customState.pieces.filter(
    (piece) => piece.boardTop >= 0 && piece.boardLeft >= 0,
  );

  const pieceElements = boardPieces.map((piece) => (
    <Piece
      key={piece.id}
      piece={piece}
      where="board"
      overlapGrid={undefined}
      gameIsSolved={false}
      dispatchGameState={dispatchGameState}
      // todo later add validity grid
    />
  ));

    // Any pieces that are currently being dragged over the board will render on the board as a single drag shadow
    let dragShadow;
    if (dragDestination?.where === "board") {
      const draggedPieces = customState.pieces.filter((piece) =>
        dragPieceIDs.includes(piece.id),
      );
      const grid = countingGrid(12, 12, draggedPieces);
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
          action: "shiftStart",//todo rename to boardShiftStart
          pointerID: event.pointerId,
          pointer: {x: event.clientX, y: event.clientY},
        });
      }}
    >
      {pieceElements}
      {dragShadow}
    </div>
  );
}
