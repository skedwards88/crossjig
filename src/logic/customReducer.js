import {updatePieceDatum} from "./assemblePiece";
import {getConnectedPieceIDs} from "./getConnectedPieceIDs";
import {updateDragState} from "./updateDragState";

function updateStateForDragStart({
  currentGameState,
  isPartOfCurrentDrag, // function that takes a piece and returns a bool indicating whether the piece is being dragged
  pointerID, // (integer): The ID of the pointer, as captured by the pointer down event.
  pointerStartPosition, // (object with fields `x` and `y`): The x and y position of the pointer, as captured by the pointer down event.
  boardIsShifting, // (boolean): Whether the whole board is being dragged.
  previousDragState,
}) {
  if (currentGameState.dragState !== undefined) {
    console.warn("Tried to start a drag while a drag was in progress");
    return currentGameState;
  }

  // Find which pieces are selected, which are not, and the top left of the group (in board squares).
  let piecesBeingDragged = [];
  let piecesNotBeingDragged = [];
  let groupBoardTop = currentGameState.gridSize;
  let groupBoardLeft = currentGameState.gridSize;
  const poolPieces = currentGameState.pieces.filter(
    (piece) => piece.poolIndex >= 0,
  );
  let poolIndex = poolPieces.length;

  for (const piece of currentGameState.pieces) {
    if (isPartOfCurrentDrag(piece)) {
      piecesBeingDragged.push(piece);
      // todo figure out what is going on here
      if (groupBoardTop !== undefined) {
        if (piece.boardTop !== undefined) {
          groupBoardTop = Math.min(groupBoardTop, piece.boardTop);
          groupBoardLeft = Math.min(groupBoardLeft, piece.boardLeft);
        } else {
          groupBoardTop = undefined;
          groupBoardLeft = undefined;
          if (piece.poolIndex !== undefined) {
            poolIndex = Math.min(poolIndex, piece.poolIndex);
          }
        }
      }
    } else {
      piecesNotBeingDragged.push(piece);
    }
  }

  if (piecesBeingDragged.length === 0) {
    console.warn("Tried to start a drag but no pieces are being dragged");
    return currentGameState;
  }

  let pointerOffset;
  if (previousDragState && previousDragState.pieceIDs.length == 1) {
    // If we were previously just dragging one piece and have now potentially expanded to drag multiple pieces,
    // use previous pointerOffset, adjusted for the different group of pieces we have now.
    const previousPiece = currentGameState.pieces.filter(
      (piece) => piece.id == previousDragState.pieceIDs[0],
    )[0];
    const extraSquaresLeft = previousPiece.boardLeft - groupBoardLeft;
    const extraSquaresTop = previousPiece.boardTop - groupBoardTop;
    const boardRect = document.getElementById("board").getBoundingClientRect();
    const squareWidth = (boardRect.width - 1) / currentGameState.gridSize;
    const squareHeight = (boardRect.height - 1) / currentGameState.gridSize;
    pointerOffset = {
      x: previousDragState.pointerOffset.x + squareWidth * extraSquaresLeft,
      y: previousDragState.pointerOffset.y + squareHeight * extraSquaresTop,
    };
  } else {
    // Find the top left of the group in client coordinates, to get pointerOffset.
    const rectangles = piecesBeingDragged.flatMap((piece) => {
      const element = document.getElementById(`piece-${piece.id}`);
      if (!element) {
        console.warn(
          `dragStart: element for piece ${piece.id} not found in DOM`,
        );
        return [];
      }
      return [element.getBoundingClientRect()];
    });
    if (rectangles.length === 0) {
      return currentGameState;
    }
    const dragGroupTop = Math.min(...rectangles.map((rect) => rect.top));
    const dragGroupLeft = Math.min(...rectangles.map((rect) => rect.left));
    pointerOffset = {
      x: pointerStartPosition.x - dragGroupLeft,
      y: pointerStartPosition.y - dragGroupTop,
    };
  }

  // If dragging from the pool, add a dummy placeholder
  let placeholderPoolPieces = [];
  if (groupBoardTop === undefined) {
    placeholderPoolPieces = piecesBeingDragged.map((piece) =>
      updatePieceDatum(piece, {
        letters: [[""]],
        id: (piece.id + 1) * (-1)
      }),
    )
  }

  currentGameState = {
    ...currentGameState,
    pieces: piecesNotBeingDragged.concat(
      piecesBeingDragged.map((piece) =>
        updatePieceDatum(piece, {
          //todo add an empty letter here if dragging from pool?
          boardTop: undefined,
          boardLeft: undefined,
          poolIndex: undefined,
          dragGroupTop:
            groupBoardTop === undefined ? 0 : piece.boardTop - groupBoardTop,
          dragGroupLeft:
            groupBoardLeft === undefined ? 0 : piece.boardLeft - groupBoardLeft,
        }),
      ),
    ).concat(placeholderPoolPieces),
    dragCount: currentGameState.dragCount + 1,
    dragState: updateDragState({
      pieceIDs: piecesBeingDragged.map((piece) => piece.id),
      boardIsShifting,
      dragHasMoved: false,
      pointerID,
      pointerStartPosition: pointerStartPosition,
      pointer: pointerStartPosition,
      pointerOffset,
      origin:
        groupBoardTop !== undefined
          ? {where: "board"}
          : {where: "pool", index: poolIndex}, // todo add to updateDragState docs
      destination:
        groupBoardTop !== undefined
          ? {where: "board", top: groupBoardTop, left: groupBoardLeft}
          : {where: "pool", index: poolIndex},
    }),
  };

  // Don' bother updating the pool index like we do in the game, since the pool will never be depleted

  // Clear `gameIsSolved`, but don't recompute the whole completion state. This prevents
  // the `gameIsSolvedReason` from disappearing on each drag when all the pieces are
  // on the board but the puzzle isn't solved yet.
  return {
    ...currentGameState,
    gameIsSolved: false,
  };
}

// We let the pointer wander a few pixels before setting dragHasMoved.
function pointerHasMovedQ(start, pointer) {
  const NOT_FAR = 9.0; // pixels
  return Math.hypot(pointer.x - start.x, pointer.y - start.y) > NOT_FAR;
}

function updateStateForDragEnd(currentGameState) {
  if (currentGameState.dragState === undefined) {
    console.warn("dragEnd called with no dragState");
    return currentGameState;
  }

  const destination = currentGameState.dragState.destination;
  const origin = currentGameState.dragState.origin;
  const draggedPieceIDs = currentGameState.dragState.pieceIDs;
  let newPieces = [];
  if (destination.where === "board") {
    let maxID = Math.max(...currentGameState.pieces.map((piece) => piece.id));

    // Any letters dropped on the board will overwrite anything at that position
    // (this is a deviation from the standard game)
    let overwrittenPositions = [];
    for (const piece of currentGameState.pieces) {
      if (draggedPieceIDs.includes(piece.id)) {
        overwrittenPositions.push([
          destination.top + piece.dragGroupTop,
          destination.left + piece.dragGroupLeft,
        ]);
      }
    }

    for (const piece of currentGameState.pieces) {
      if (draggedPieceIDs.includes(piece.id)) {
        newPieces.push(
          updatePieceDatum(piece, {
            boardTop: destination.top + piece.dragGroupTop,
            boardLeft: destination.left + piece.dragGroupLeft,
            dragGroupTop: undefined,
            dragGroupLeft: undefined,
          }),
        );

        // If dragging from pool to board, also add a replacement to the pool
        if (origin.where === "pool") {
          maxID++;
          newPieces.push(
            updatePieceDatum(piece, {
              dragGroupTop: undefined,
              dragGroupLeft: undefined,
              poolIndex: origin.index,
              id: maxID,
            }),
          );
        }
      } else if (
        piece.letters[0][0] !== "" &&
        !overwrittenPositions.some(
          (position) =>
            position[0] == piece.boardTop && position[1] == piece.boardLeft,
        )
      ) {
        newPieces.push(piece);
      }
    }
  } else if (destination.where === "pool" && origin.where === "board") {
    // If dragging from board to pool, clear the piece from the board but don't add it to the pool
    for (const piece of currentGameState.pieces) {
      if (draggedPieceIDs.includes(piece.id)) {
        continue;
      } else if (piece.letters[0][0] !== ""){
        newPieces.push(piece);
      }
    }
  }
  // If dragging from pool to pool, readd the piece to the pool at its original position
  else if (destination.where === "pool" && origin.where === "pool") {
    for (const piece of currentGameState.pieces) {
      if (draggedPieceIDs.includes(piece.id)) {
        newPieces.push(
          updatePieceDatum(piece, {
            poolIndex: origin.index,
            dragGroupTop: undefined,
            dragGroupLeft: undefined,
          }),
        );
      } else if (piece.letters[0][0] !== ""){
        newPieces.push(piece);
      }
    }
  }

  return {
    ...currentGameState,
    pieces: newPieces,
    dragState: undefined,
  };
}

export function customReducer(currentGameState, payload) {
  if (payload.action === "dragStart") {
    const {pieceID, pointerID, pointerStartPosition} = payload;
    return updateStateForDragStart({
      currentGameState,
      isPartOfCurrentDrag: (piece) => piece.id === pieceID,
      pointerID,
      pointerStartPosition,
      boardIsShifting: false,
    });
  } else if (payload.action === "dragNeighbors") {
    // Fired when the timer fires, if `!dragHasMoved`
    // Drop the current piece, then pick up it and all connected pieces
    const {dragState} = currentGameState;
    if (dragState === undefined || dragState.pieceIDs.length !== 1) {
      return currentGameState;
    }

    const droppedGameState = updateStateForDragEnd(currentGameState);

    const connectedPieceIDs = getConnectedPieceIDs({
      pieces: droppedGameState.pieces,
      gridSize: droppedGameState.gridSize,
      draggedPieceID: dragState.pieceIDs[0],
    });

    return updateStateForDragStart({
      currentGameState: droppedGameState,
      isPartOfCurrentDrag: (piece) => connectedPieceIDs.includes(piece.id),
      pointerID: dragState.pointerID,
      pointerStartPosition: dragState.pointer,
      boardIsShifting: false,
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
      dragState: updateDragState(prevDrag, {
        pointer,
        destination: destination ?? prevDrag.destination,
        dragHasMoved:
          prevDrag.dragHasMoved ||
          pointerHasMovedQ(prevDrag.pointerStartPosition, pointer),
      }),
    };
  } else if (payload.action === "dragEnd") {
    // Fired on lostpointercapture, after `dragMove`.
    //
    // Drop all dragged pieces to `destination` and clear `dragState`.
    return updateStateForDragEnd(currentGameState);
  } else if (payload.action === "shiftStart") {
    // Fired on pointerdown in an empty square on the board.
    //
    // Initializes `dragState`. Starts a drag on all pieces that are on the board.
    // Sets `destination` to where they currently are.
    const {pointerID, pointerStartPosition} = payload;
    return updateStateForDragStart({
      currentGameState,
      isPartOfCurrentDrag: (piece) => piece.boardTop !== undefined,
      pointerID,
      pointerStartPosition,
      boardIsShifting: true,
    });
  } else {
    console.log(`unknown action: ${payload.action}`);
    return currentGameState;
  }
}
