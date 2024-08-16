import {dragStart, dragEnd, getConnectedPieceIDs, hasMoved} from "./gameReducer";

// todo wip new, incomplete file

// todo reconcile currentGameState vs currentState
export function customReducer(currentGameState, payload) {
  console.log("custom: " + payload.action)
  console.log(currentGameState)

  // todo consolidate shared action handling between this reducer and other reducer. (pull out into functions.)

  if (payload.action === "dragStart") {
   // Fired on pointerdown on a piece anywhere.
    // Captures initial `dragState`. `destination` is initialized to where the piece already is.
    const {pieceID, pointerID, pointer} = payload;
    return dragStart({
      currentGameState,
      isPartOfCurrentDrag: (piece) => piece.id === pieceID,
      pointerID,
      pointer,
      isShifting: false,
    });
  } else if (payload.action === "dragNeighbors") {
    // Fired when the timer fires, if `!dragHasMoved`.
    //
    // Set `piece.isDragging` on all neighbors using `destination` to figure out
    // which pieces are neighbors. Implemented by dropping the current piece, then picking
    // it and all connected pieces up again.
    const {dragState} = currentGameState;
    if (dragState === undefined || dragState.pieceIDs.length !== 1) {
      return currentGameState;
    }

    const droppedGameState = dragEnd(currentGameState);
    const connectedPieceIDs = getConnectedPieceIDs({
      pieces: droppedGameState.pieces,
      gridSize: droppedGameState.gridSize,
      draggedPieceID: dragState.pieceIDs[0],
    });
    return dragStart({
      currentGameState: droppedGameState,
      isPartOfCurrentDrag: (piece) => connectedPieceIDs.includes(piece.id),
      pointerID: dragState.pointerID,
      pointer: dragState.pointer,
      isShifting: false,
      previousDragState: dragState,
    });
  } else if (payload.action === "dragMove") {
    // Fired on pointermove and on lostpointercapture.
    const prevDrag = currentGameState.dragState;
    if (prevDrag === undefined) {
      return currentGameState;
    }
    const {pointer, destination} = payload;
    return {
      ...currentGameState,
      dragState: {
        ...prevDrag,
        pointer,
        destination: destination ?? prevDrag.destination,
        dragHasMoved:
          prevDrag.dragHasMoved || hasMoved(prevDrag.pointerStart, pointer),
      },
    };
  } else if (payload.action === "dragEnd") {
    // Fired on lostpointercapture, after `dragMove`.
    //
    // Drop all dragged pieces to `destination` and clear `dragState`.
    return dragEnd(currentGameState);
  } else if (payload.action === "shiftStart") {
    // Fired on pointerdown in an empty square on the board.
    //
    // Initializes `dragState`. Starts a drag on all pieces that are on the board.
    // Sets `destination` to where they currently are.
    const {pointerID, pointer} = payload;
    return dragStart({
      currentGameState,
      isPartOfCurrentDrag: (piece) => piece.boardTop !== undefined,
      pointerID,
      pointer,
      isShifting: true,
    });
  } else {
    console.log(`unknown action: ${payload.action}`);
    return currentGameState;
  }
}
