import Piece from "./Piece";
import React from "react";
import {dragDestinationOnBoard} from "./Board";
import {dragDestinationInPool} from "./Pool";

// This component is mounted each time a drag starts.
export default function DragGroup({dispatchGameState, gameState}) {
  const dragState = gameState.dragState;
  const boardIsShifting = dragState.boardIsShifting;
  const draggedPieces = gameState.pieces.filter((piece) =>
    dragState.pieceIDs.includes(piece.id),
  );

  // Capture the pointer. If the pointer could not be captured successfully, end the drag.
  const dragGroup = React.useRef(null);
  React.useEffect(() => {
    const element = dragGroup.current;
    let ok = true;
    try {
      element.setPointerCapture(dragState.pointerID);
    } catch (exc) {
      console.warn("Failed to capture pointer:", exc);
      ok = false;
    }
    ok &&= element.hasPointerCapture(dragState.pointerID);
    if (!ok) {
      dispatchGameState({action: "dragEnd"});
    }
    // Cleanup function to release the pointer.
    return () => {
      if (ok) {
        try {
          element.releasePointerCapture(dragState.pointerID);
        } catch (exc) {
          // The pointer is invalid. Normal on touch screens. Ignore it.
        }
      }
    };
  }, [dragState.pointerID, dispatchGameState]);

  // Multi-select timer.
  React.useEffect(() => {
    // If the whole board is shifting,
    // or if the drag isn't on the board,
    // or if the drag position has moved since the start of the drag,
    // don't start a multi-select.
    if (
      boardIsShifting ||
      dragState.destination.where != "board" ||
      dragState.dragHasMoved
    ) {
      return undefined;
    }
    let timerID = setTimeout(() => {
      dispatchGameState({action: "dragNeighbors"});
      timerID = undefined;
    }, 500);
    return () => {
      if (timerID !== undefined) {
        clearTimeout(timerID);
      }
    };
  }, [
    boardIsShifting,
    dragState.destination.where,
    dragState.dragHasMoved,
    dispatchGameState,
  ]);

  // Compute location.
  let top = dragState.pointer.y - dragState.pointerOffset.y;
  let left = dragState.pointer.x - dragState.pointerOffset.x;
  const groupRows = Math.max(
    ...draggedPieces.map((piece) => piece.dragGroupTop + piece.letters.length),
  );
  const groupColumns = Math.max(
    ...draggedPieces.map(
      (piece) => piece.dragGroupLeft + piece.letters[0].length,
    ),
  );
  if (boardIsShifting) {
    // Clamp to the board rectangle.
    const board = document.getElementById("board")?.getBoundingClientRect();
    if (board) {
      const minLeft = board.left;
      const minTop = board.top;
      const boxWidth = board.width / gameState.gridSize;
      const boxHeight = board.height / gameState.gridSize;
      const maxLeft = minLeft + boxWidth * (gameState.gridSize - groupColumns);
      const maxTop = minTop + boxHeight * (gameState.gridSize - groupRows);
      left = Math.max(minLeft, Math.min(left, maxLeft));
      top = Math.max(minTop, Math.min(top, maxTop));
    }
  }

  const onPointerMove = (event) => {
    event.preventDefault();
    const pointer = {x: event.clientX, y: event.clientY};
    dispatchGameState({
      action: "dragMove",
      pointer,
      destination: getDragDestination(gameState, pointer),
    });
  };
  const onLostPointerCapture = (event) => {
    // On iOS Safari, apparently the coordinates are (0, 0) when the pointer is lost,
    // not the pointer-up location.
    if (event.clientX != 0 || event.clientY != 0) {
      onPointerMove(event);
    }
    dispatchGameState({action: "dragEnd"});
  };

  return (
    <div
      id="drag-group"
      ref={dragGroup}
      style={{
        position: "absolute",
        top,
        left,
        "--grid-rows": groupRows,
        "--grid-columns": groupColumns,
      }}
      onPointerMove={onPointerMove}
      onLostPointerCapture={onLostPointerCapture}
    >
      {draggedPieces.map((piece) => (
        <Piece
          key={piece.id}
          piece={piece}
          where="drag"
          overlapGrid={undefined}
          gameIsSolved={false}
          dispatchGameState={dispatchGameState}
        />
      ))}
    </div>
  );
}

function getDragDestination(gameState, pointer) {
  let destination = undefined;
  if (!gameState.dragState.boardIsShifting) {
    destination = dragDestinationInPool(pointer);
  }
  destination ??= dragDestinationOnBoard(gameState, pointer);
  return destination;
}
