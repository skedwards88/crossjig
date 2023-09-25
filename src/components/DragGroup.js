import Piece from "./Piece";
import React from "react";

// This component is mounted each time a drag starts.
export default function DragGroup({ dispatchGameState, gameState }) {
  const dragState = gameState.dragState;

  const isShifting = dragState.isShifting;
  let draggedPieces = gameState.pieces
    .filter((piece) => dragState.pieceIDs.includes(piece.id));

  React.useEffect(
    () => {
      if (isShifting || dragState.destination.where != "board" || dragState.dragHasMoved) {
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
    },
    [dragState.dragHasMoved, isShifting],
  );

  const dragGroup = React.useRef(null);
  React.useEffect(() => {
    dragGroup.current.setPointerCapture(dragState.pointerID);
    if (!dragGroup.current.hasPointerCapture(dragState.pointerID)) {
      console.warn("Failed to capture pointer");
      dispatchGameState({ action: !isShifting ? "dragEnd" : "shiftEnd" });
    }
    return () => {
      if (dragGroup.current) {
        dragGroup.current.releasePointerCapture(dragState.pointerID);
      }
    };
  }, [dragState.pointerID]);

  const onPointerMove = (event) => {
    event.preventDefault();
    dispatchGameState({
      action: !isShifting ? "dragMove" : "shiftMove",
      pointer: { x: event.clientX, y: event.clientY },
    });
  };
  const onLostPointerCapture = (event) => {
    onPointerMove(event);
    dispatchGameState({ action: !isShifting ? "dragEnd" : "shiftEnd" });
  };

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
        ...draggedPieces.map((piece) => piece.groupLeft + piece.letters[0].length)
      );
      const maxLeft = minLeft + boxWidth * (gameState.gridSize - groupWidth);
      const maxTop = minTop + boxHeight * (gameState.gridSize - groupHeight);
      left = Math.max(minLeft, Math.min(left, maxLeft));
      top = Math.max(minTop, Math.min(top, maxTop));
    }
  }

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