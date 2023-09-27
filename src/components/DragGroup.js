import Piece from "./Piece";
import React from "react";

// This component is mounted each time a drag starts.
export default function DragGroup({ dispatchGameState, gameState }) {
  const dragState = gameState.dragState;
  const isShifting = dragState.isShifting;
  const draggedPieces = gameState.pieces.filter((piece) =>
    dragState.pieceIDs.includes(piece.id)
  );

  // Capture the pointer.
  const dragGroup = React.useRef(null);
  React.useEffect(() => {
    let ok = true;
    try {
      dragGroup.current.setPointerCapture(dragState.pointerID);
    } catch (exc) {
      console.warn("Failed to capture pointer:", exc);
      ok = false;
    }
    ok &&= dragGroup.current.hasPointerCapture(dragState.pointerID);
    if (!ok) {
      dispatchGameState({ action: "dragEnd" });
    }
    return () => {
      if (ok && dragGroup.current) {
        dragGroup.current.releasePointerCapture(dragState.pointerID);
      }
    };
  }, [dragGroup, dragState.pointerID]);

  // Multi-select timer.
  React.useEffect(() => {
    if (
      isShifting ||
      dragState.destination.where != "board" ||
      dragState.dragHasMoved
    ) {
      return undefined;
    }
    let timerID = setTimeout(() => {
      dispatchGameState({ action: "dragNeighbors" });
      timerID = undefined;
    }, 500);
    return () => {
      if (timerID !== undefined) {
        clearTimeout(timerID);
      }
    };
  }, [isShifting, dragState.destination.where, dragState.dragHasMoved]);

  // Compute location.
  let top = dragState.pointer.y - dragState.pointerOffset.y;
  let left = dragState.pointer.x - dragState.pointerOffset.x;
  if (isShifting) {
    // Clamp to the board rectangle.
    const board = document.getElementById("board")?.getBoundingClientRect();
    if (board) {
      const minLeft = board.left;
      const minTop = board.top;
      const boxWidth = board.width / gameState.gridSize;
      const boxHeight = board.height / gameState.gridSize;
      const groupHeight = Math.max(
        ...draggedPieces.map((piece) => piece.groupTop + piece.letters.length)
      );
      const groupWidth = Math.max(
        ...draggedPieces.map(
          (piece) => piece.groupLeft + piece.letters[0].length
        )
      );
      const maxLeft = minLeft + boxWidth * (gameState.gridSize - groupWidth);
      const maxTop = minTop + boxHeight * (gameState.gridSize - groupHeight);
      left = Math.max(minLeft, Math.min(left, maxLeft));
      top = Math.max(minTop, Math.min(top, maxTop));
    }
  }

  const onPointerMove = (event) => {
    event.preventDefault();
    const pointer = { x: event.clientX, y: event.clientY };
    dispatchGameState({
      action: "dragMove",
      pointer,
      destination: dragDestination(gameState, pointer),
    });
  };
  const onLostPointerCapture = (event) => {
    onPointerMove(event);
    dispatchGameState({ action: "dragEnd" });
  };

  return (
    <div
      id="dragGroup"
      ref={dragGroup}
      style={{
        position: "absolute",
        top,
        left,
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

function dragDestination(gameState, pointer) {
  if (!gameState.dragState.isShifting) {
    let poolElement =
      document.getElementById("pool") || document.getElementById("result");
    let poolRect = poolElement.getBoundingClientRect();
    if (
      poolRect.left <= pointer.x &&
      pointer.x <= poolRect.right &&
      poolRect.top <= pointer.y &&
      pointer.y <= poolRect.bottom
    ) {
      if (gameState.dragState.destination.where === "pool") {
        return gameState.dragState.destination;
      }
      let poolPieces = gameState.pieces.filter(
        (piece) => piece.poolIndex >= 0
      );
      return { where: "pool", index: poolPieces.length };
    }
  }

  let boardRect = document.getElementById("board").getBoundingClientRect();
  if (
    gameState.dragState.destination.where === "board" ||
    (boardRect.left <= pointer.x &&
      pointer.x <= boardRect.right &&
      boardRect.top <= pointer.y &&
      pointer.y <= boardRect.bottom)
  ) {
    const draggedPieceIDs = gameState.dragState.pieceIDs;
    const draggedPieces = gameState.pieces.filter((piece) =>
      draggedPieceIDs.includes(piece.id)
    );

    const groupHeight = Math.max(
      ...draggedPieces.map((piece) => piece.groupTop + piece.letters.length)
    );
    const groupWidth = Math.max(
      ...draggedPieces.map((piece) => piece.groupLeft + piece.letters[0].length)
    );
    const maxTop = gameState.gridSize - groupHeight;
    const maxLeft = gameState.gridSize - groupWidth;

    const squareWidth = (boardRect.width - 1) / gameState.gridSize;
    const squareHeight = (boardRect.height - 1) / gameState.gridSize;
    const pointerOffset = gameState.dragState.pointerOffset;
    const unclampedLeft = Math.round(
      (pointer.x - pointerOffset.x - boardRect.left) / squareWidth
    );
    const unclampedTop = Math.round(
      (pointer.y - pointerOffset.y - boardRect.top) / squareHeight
    );
    const left = Math.max(0, Math.min(maxLeft, unclampedLeft));
    const top = Math.max(0, Math.min(maxTop, unclampedTop));

    return { where: "board", top, left };
  }

  return undefined;
}
