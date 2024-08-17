import sendAnalytics from "../common/sendAnalytics";
import {gameSolvedQ} from "./gameSolvedQ";
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

  currentGameState = {
    ...currentGameState,
    pieces: piecesNotBeingDragged.concat(
      piecesBeingDragged.map((piece) =>
        updatePieceDatum(piece, {
          boardTop: undefined,
          boardLeft: undefined,
          poolIndex: undefined,
          dragGroupTop:
            groupBoardTop === undefined ? 0 : piece.boardTop - groupBoardTop,
          dragGroupLeft:
            groupBoardLeft === undefined ? 0 : piece.boardLeft - groupBoardLeft,
        }),
      ),
    ),
    dragCount: currentGameState.dragCount + 1,
    dragState: updateDragState({
      pieceIDs: piecesBeingDragged.map((piece) => piece.id),
      boardIsShifting,
      dragHasMoved: false,
      pointerID,
      pointerStartPosition: pointerStartPosition,
      pointer: pointerStartPosition,
      pointerOffset,
      destination:
        groupBoardTop !== undefined
          ? {where: "board", top: groupBoardTop, left: groupBoardLeft}
          : {where: "pool", index: poolIndex},
    }),
  };

  if (piecesBeingDragged.some((piece) => piece.poolIndex !== undefined)) {
    // A piece was removed from the pool, so recompute poolIndex for the other pieces.
    let remainingPoolPieces = currentGameState.pieces.filter(
      (piece) => piece.poolIndex !== undefined,
    );
    remainingPoolPieces.sort((a, b) => a.poolIndex - b.poolIndex);
    let poolIndices = Array(currentGameState.pieces.length).fill(-1);
    remainingPoolPieces.forEach((piece, index) => {
      poolIndices[piece.id] = index;
    });
    currentGameState = {
      ...currentGameState,
      pieces: currentGameState.pieces.map((piece) =>
        piece.poolIndex === undefined
          ? piece
          : updatePieceDatum(piece, {poolIndex: poolIndices[piece.id]}),
      ),
    };
  }

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
  const draggedPieceIDs = currentGameState.dragState.pieceIDs;
  let mapper;
  if (destination.where === "board") {
    mapper = (piece) =>
      draggedPieceIDs.includes(piece.id)
        ? updatePieceDatum(piece, {
            boardTop: destination.top + piece.dragGroupTop,
            boardLeft: destination.left + piece.dragGroupLeft,
            dragGroupTop: undefined,
            dragGroupLeft: undefined,
          })
        : piece;
  } else {
    let poolIndex = destination.index;
    mapper = (piece) =>
      draggedPieceIDs.includes(piece.id)
        ? updatePieceDatum(piece, {
            poolIndex: poolIndex++,
            dragGroupTop: undefined,
            dragGroupLeft: undefined,
          })
        : piece.poolIndex !== undefined && piece.poolIndex >= destination.index
        ? updatePieceDatum(piece, {
            poolIndex: piece.poolIndex + draggedPieceIDs.length,
          })
        : piece;
  }
  return updateCompletionState({
    ...currentGameState,
    pieces: currentGameState.pieces.map(mapper),
    dragState: undefined,
  });
}

function getCompletionData(currentGameState) {
  const allPiecesAreUsed = currentGameState.pieces.every(
    (piece) => piece.boardTop >= 0 && piece.boardLeft >= 0,
  );

  if (!allPiecesAreUsed) {
    return {
      allPiecesAreUsed: false,
      gameIsSolved: false,
      gameIsSolvedReason: "",
    };
  }

  const {gameIsSolved, reason: gameIsSolvedReason} = gameSolvedQ(
    currentGameState.pieces,
    currentGameState.gridSize,
  );

  if (gameIsSolved && !currentGameState.gameIsSolved) {
    sendAnalytics("won");
  }

  return {
    allPiecesAreUsed: true,
    gameIsSolved: gameIsSolved,
    gameIsSolvedReason: gameIsSolvedReason,
  };
}

function updateCompletionState(gameState) {
  return {
    ...gameState,
    ...getCompletionData(gameState),
  };
}

export function customReducer(currentGameState, payload) {
  if (payload.action === "dragStart") {
    // Fired on pointerdown on a piece anywhere.
    // Captures initial `dragState`. `destination` is initialized to where the piece already is.
    const {pieceID, pointerID, pointerStartPosition} = payload;
    return updateStateForDragStart({
      currentGameState,
      isPartOfCurrentDrag: (piece) => piece.id === pieceID,
      pointerID,
      pointerStartPosition,
      boardIsShifting: false,
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
