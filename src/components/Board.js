import React from "react";
import Piece from "./Piece";
import DragShadow from "./DragShadow";
import {getLetterCountPerSquare} from "../logic/getLetterCountPerSquare";
import {getWordValidityGrids} from "../logic/getWordValidityGrids";

export default function Board({
  pieces,
  gridSize,
  dragPieceIDs,
  dragDestination,
  gameIsSolved,
  dispatchGameState,
  indicateValidity,
  customCreation = false,
}) {
  const boardPieces = pieces.filter(
    (piece) => piece.boardTop >= 0 && piece.boardLeft >= 0,
  );

  const overlapGrid = customCreation
    ? undefined
    : getLetterCountPerSquare(gridSize, gridSize, boardPieces);

  const [horizontalValidityGrid, verticalValidityGrid] = indicateValidity
    ? getWordValidityGrids({
        pieces,
        gridSize,
        includeOriginalSolution: !customCreation,
      })
    : [undefined, undefined];

  const pieceElements = boardPieces.map((piece) => (
    <Piece
      key={piece.id}
      piece={piece}
      where="board"
      overlapGrid={overlapGrid}
      gameIsSolved={gameIsSolved}
      dispatchGameState={dispatchGameState}
      horizontalValidityGrid={horizontalValidityGrid}
      verticalValidityGrid={verticalValidityGrid}
    />
  ));

  // Any pieces that are currently being dragged over the board will render on the board as a single drag shadow
  let dragShadow;
  if (dragDestination?.where === "board") {
    const draggedPieces = pieces.filter((piece) =>
      dragPieceIDs.includes(piece.id),
    );
    const grid = getLetterCountPerSquare(gridSize, gridSize, draggedPieces);
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
          pointerID: event.pointerId,
          pointerStartPosition: {x: event.clientX, y: event.clientY},
        });
      }}
    >
      {pieceElements}
      {dragShadow}
    </div>
  );
}

export function dragDestinationOnBoard(gameState, pointer) {
  const boardRect = document.getElementById("board").getBoundingClientRect();
  if (
    gameState.dragState.destination.where === "board" ||
    (boardRect.left <= pointer.x &&
      pointer.x <= boardRect.right &&
      boardRect.top <= pointer.y &&
      pointer.y <= boardRect.bottom)
  ) {
    const draggedPieceIDs = gameState.dragState.pieceIDs;
    const draggedPieces = gameState.pieces.filter((piece) =>
      draggedPieceIDs.includes(piece.id),
    );

    const groupHeight = Math.max(
      ...draggedPieces.map(
        (piece) => piece.dragGroupTop + piece.letters.length,
      ),
    );
    const groupWidth = Math.max(
      ...draggedPieces.map(
        (piece) => piece.dragGroupLeft + piece.letters[0].length,
      ),
    );
    const maxTop = gameState.gridSize - groupHeight;
    const maxLeft = gameState.gridSize - groupWidth;

    // Subtract 1 before dividing because the board is n squares wide, but has n+1 1px borders.
    // (It's admittedly silly to care about this, since the impact is only 1/n of a pixel!)
    const squareWidth = (boardRect.width - 1) / gameState.gridSize;
    const squareHeight = (boardRect.height - 1) / gameState.gridSize;
    const pointerOffset = gameState.dragState.pointerOffset;
    const unclampedLeft = Math.round(
      (pointer.x - pointerOffset.x - boardRect.left) / squareWidth,
    );
    const unclampedTop = Math.round(
      (pointer.y - pointerOffset.y - boardRect.top) / squareHeight,
    );
    const left = Math.max(0, Math.min(maxLeft, unclampedLeft));
    const top = Math.max(0, Math.min(maxTop, unclampedTop));

    return {where: "board", top, left};
  }

  return undefined;
}
