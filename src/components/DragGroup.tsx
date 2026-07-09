import Piece from "./Piece";
import React from "react";
import {dragDestinationOnBoard} from "./Board";
import {dragDestinationInPool} from "./Pool";
import type {GameReducerPayload} from "../logic/gameReducer";
import type {
  CSSPropertiesWithVars,
  DragDestination,
  DragState,
  PieceInDrag,
  PieceInGame,
  Position,
} from "../Types";
import type {
  PieceInCustom,
  PieceInCustomDrag,
} from "../logic/customCreationInit";
import {type CustomCreationReducerPayload} from "../logic/customCreationReducer";
import {type DailyReducerPayload} from "../logic/dailyReducer";
import {type AdventureReducerPayload} from "../logic/adventure";

// This component is mounted each time a drag starts.
export default function DragGroup<T extends PieceInGame | PieceInCustom>({
  dispatchGameState,
  dragState,
  pieces,
  gridSize,
}: {
  dispatchGameState:
    | React.Dispatch<GameReducerPayload>
    | React.Dispatch<AdventureReducerPayload>
    | React.Dispatch<DailyReducerPayload>
    | React.Dispatch<CustomCreationReducerPayload>;
  dragState: DragState;
  pieces: T[];
  gridSize: number;
}): React.JSX.Element {
  const boardIsShifting = dragState.boardIsShifting;
  const draggedPieces = pieces.filter(
    (piece): piece is T & (PieceInDrag | PieceInCustomDrag) =>
      dragState.pieceIDs.includes(piece.id),
  );

  // Capture the pointer. If the pointer could not be captured successfully, end the drag.
  const dragGroup = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const element = dragGroup.current;
    if (!element) {
      return;
    }
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
    return (): void => {
      if (ok) {
        try {
          element.releasePointerCapture(dragState.pointerID);
        } catch {
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
    let timerID: NodeJS.Timeout | undefined = setTimeout(() => {
      dispatchGameState({action: "dragNeighbors"});
      timerID = undefined;
    }, 500);
    return (): void => {
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
      const boxWidth = board.width / gridSize;
      const boxHeight = board.height / gridSize;
      const maxLeft = minLeft + boxWidth * (gridSize - groupColumns);
      const maxTop = minTop + boxHeight * (gridSize - groupRows);
      left = Math.max(minLeft, Math.min(left, maxLeft));
      top = Math.max(minTop, Math.min(top, maxTop));
    }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const pointer = {x: event.clientX, y: event.clientY};
    dispatchGameState({
      action: "dragMove",
      pointer,
      destination: getDragDestination({dragState, pointer, gridSize, pieces}),
    });
  };
  const onLostPointerCapture = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
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
      style={
        {
          position: "absolute",
          top,
          left,
          "--grid-rows": groupRows,
          "--grid-columns": groupColumns,
        } as CSSPropertiesWithVars
      }
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

function getDragDestination<T extends PieceInGame | PieceInCustom>({
  dragState,
  pointer,
  gridSize,
  pieces,
}: {
  dragState: DragState;
  pointer: Position;
  gridSize: number;
  pieces: T[];
}): DragDestination | undefined {
  let destination = undefined;
  if (!dragState.boardIsShifting) {
    destination = dragDestinationInPool(pointer);
  }
  destination ??= dragDestinationOnBoard({
    dragState,
    pointer,
    gridSize,
    pieces,
  });
  return destination;
}
