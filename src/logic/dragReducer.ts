import {getConnectedPieceIDs} from "./getConnectedPieceIDs";
import type {
  DragDestination,
  GameState,
  Position,
  PieceInGame,
  PieceInBoard,
  PieceInDrag,
  PieceInPool,
  DragState,
  LetterOrEmpty,
} from "../Types";
import {
  type PieceInCustom,
  type PieceInCustomDrag,
  type CustomCreationState,
} from "./customCreationInit";
import {updateCompletionState} from "./gameReducer";

export type DragReducerPayload =
  | {
      action: "dragStart";
      pieceID: number;
      pointerID: number;
      pointerStartPosition: Position;
    }
  | {action: "dragNeighbors"}
  | {
      action: "dragMove";
      pointer: Position;
      destination: DragDestination | undefined;
    }
  | {action: "dragEnd"}
  | {action: "shiftStart"; pointerID: number; pointerStartPosition: Position};

function updateStateForDragStart<S extends GameState | CustomCreationState>({
  currentState,
  isPartOfCurrentDrag,
  pointerID,
  pointerStartPosition,
  boardIsShifting,
  previousDragState,
}: {
  currentState: S;
  isPartOfCurrentDrag: (piece: S["pieces"][number]) => boolean; // function that takes a piece and returns a bool indicating whether the piece is being dragged
  pointerID: number; // the ID of the pointer, as captured by the pointer down event
  pointerStartPosition: Position; // the x and y position of the pointer, as captured by the pointer down event
  boardIsShifting: boolean; // whether the whole board is being dragged
  previousDragState?: DragState;
}): S {
  if (currentState.dragState !== undefined) {
    console.warn("Tried to start a drag while a drag was in progress");
    return currentState;
  }

  type T = S["pieces"][number];
  const pieces = currentState.pieces as T[];

  const {
    piecesNotBeingDragged,
    piecesBeingDragged,
    dragGroupBoardTop,
    dragGroupBoardLeft,
    dragPoolIndex,
  } = getPiecesBeingDragged({
    currentPieces: pieces,
    gridSize: currentState.gridSize,
    isPartOfCurrentDrag,
  });

  if (piecesBeingDragged.length === 0) {
    console.warn("Tried to start a drag but no pieces are being dragged");
    return currentState;
  }

  const pointerOffset = getDragPointerOffset({
    previousDragState,
    dragGroupBoardTop,
    dragGroupBoardLeft,
    currentPieces: pieces,
    gridSize: currentState.gridSize,
    piecesBeingDragged,
    pointerStartPosition,
  });

  if (pointerOffset === null) {
    return currentState;
  }

  const newDragState = {
    pieceIDs: piecesBeingDragged.map((piece) => piece.id),
    boardIsShifting,
    dragHasMoved: false,
    pointerID,
    pointerStartPosition,
    pointer: pointerStartPosition,
    pointerOffset,
    origin:
      dragGroupBoardTop !== undefined
        ? {where: "board"}
        : {where: "pool", index: dragPoolIndex},
    destination:
      dragGroupBoardTop !== undefined
        ? {where: "board", top: dragGroupBoardTop, left: dragGroupBoardLeft}
        : {where: "pool", index: dragPoolIndex},
  } as DragState;

  const newPieces = currentState.isCustomCreating
    ? updatePiecesForDragInCustomCreating({
        piecesBeingDragged: piecesBeingDragged as PieceInCustom[],
        piecesNotBeingDragged: piecesNotBeingDragged as PieceInCustom[],
        isDraggingFromPool: dragGroupBoardTop === undefined,
        dragGroupBoardTop,
        dragGroupBoardLeft,
      })
    : updatePiecesForDragNotInCustomCreating({
        piecesBeingDragged: piecesBeingDragged as PieceInGame[],
        piecesNotBeingDragged: piecesNotBeingDragged as PieceInGame[],
        dragGroupBoardTop,
        dragGroupBoardLeft,
      });

  return {
    ...currentState,
    pieces: newPieces,
    dragCount: currentState.dragCount + 1,
    dragState: newDragState,
    // Clear `gameIsSolved`, but don't recompute the whole completion state. This prevents
    // the `gameIsSolvedReason` from disappearing on each drag when all the pieces are
    // on the board but the puzzle isn't solved yet.
    ...(!currentState.isCustomCreating && {gameIsSolved: false}),
  };
}

function applyDragToPiecesBeingDragged<T extends PieceInGame | PieceInCustom>({
  piecesBeingDragged,
  dragGroupBoardTop,
  dragGroupBoardLeft,
}: {
  piecesBeingDragged: T[];
  dragGroupBoardTop: number | undefined;
  dragGroupBoardLeft: number | undefined;
}): T[] {
  return piecesBeingDragged.map((piece) => {
    return {
      ...piece,
      boardTop: undefined,
      boardLeft: undefined,
      poolIndex: undefined,
      // the piece.boardTop/Left === undefined check is redundant based on the previous logic but required to keep TS happy
      dragGroupTop:
        dragGroupBoardTop === undefined || piece.boardTop === undefined
          ? 0
          : piece.boardTop - dragGroupBoardTop,
      dragGroupLeft:
        dragGroupBoardLeft === undefined || piece.boardLeft === undefined
          ? 0
          : piece.boardLeft - dragGroupBoardLeft,
    };
  });
}

function updatePiecesForDragNotInCustomCreating({
  piecesBeingDragged,
  piecesNotBeingDragged,
  dragGroupBoardTop,
  dragGroupBoardLeft,
}: {
  piecesBeingDragged: PieceInGame[];
  piecesNotBeingDragged: PieceInGame[];
  dragGroupBoardTop: number | undefined;
  dragGroupBoardLeft: number | undefined;
}): PieceInGame[] {
  let newPieces = piecesNotBeingDragged.concat(
    applyDragToPiecesBeingDragged({
      piecesBeingDragged,
      dragGroupBoardTop,
      dragGroupBoardLeft,
    }),
  );

  // Only for game (Don't bother updating the pool index for custom creation since the pool will never be depleted)
  if (piecesBeingDragged.some((piece) => piece.poolIndex !== undefined)) {
    // A piece was removed from the pool, so recompute poolIndex for the other pieces.
    const remainingPoolPieces = newPieces.filter(
      (piece) => piece.poolIndex !== undefined,
    );
    remainingPoolPieces.sort((a, b) => a.poolIndex - b.poolIndex);
    const poolIndices = Array(newPieces.length).fill(-1);
    remainingPoolPieces.forEach((piece, index) => {
      poolIndices[piece.id] = index;
    });
    newPieces = newPieces.map((piece) =>
      piece.poolIndex === undefined
        ? piece
        : {...piece, poolIndex: poolIndices[piece.id]},
    );
  }

  return newPieces;
}

function updatePiecesForDragInCustomCreating({
  piecesBeingDragged,
  piecesNotBeingDragged,
  dragGroupBoardTop,
  dragGroupBoardLeft,
  isDraggingFromPool,
}: {
  piecesBeingDragged: PieceInCustom[];
  piecesNotBeingDragged: PieceInCustom[];
  dragGroupBoardTop: number | undefined;
  dragGroupBoardLeft: number | undefined;
  isDraggingFromPool: boolean;
}): PieceInCustom[] {
  // (For custom creation only)
  // If dragging from the pool, add a dummy placeholder
  const placeholderPoolPieces = isDraggingFromPool
    ? piecesBeingDragged.map((piece) => {
        return {
          ...piece,
          letters: [[""]] as LetterOrEmpty[][],
          id: (piece.id + 1) * -1,
        } as PieceInCustom;
      })
    : [];

  return piecesNotBeingDragged
    .concat(
      applyDragToPiecesBeingDragged({
        piecesBeingDragged,
        dragGroupBoardTop,
        dragGroupBoardLeft,
      }),
    )
    .concat(placeholderPoolPieces);
}

function getPiecesBeingDragged<T extends PieceInGame | PieceInCustom>({
  currentPieces,
  gridSize,
  isPartOfCurrentDrag,
}: {
  currentPieces: T[];
  gridSize: number;
  isPartOfCurrentDrag: (piece: T) => boolean; // function that takes a piece and returns a bool indicating whether the piece is being dragged
}): {
  piecesNotBeingDragged: T[];
  piecesBeingDragged: T[];
  dragGroupBoardTop: number | undefined;
  dragGroupBoardLeft: number | undefined;
  dragPoolIndex: number;
} {
  // Find which pieces are selected, which are not, and the top left of the group (in board squares).
  const piecesBeingDragged: T[] = [];
  const piecesNotBeingDragged: T[] = [];
  let dragGroupBoardTop: number | undefined = gridSize;
  let dragGroupBoardLeft: number | undefined = gridSize;
  const poolPieces = currentPieces.filter(
    (piece) => piece.poolIndex !== undefined,
  );
  let dragPoolIndex = poolPieces.length;

  for (const piece of currentPieces) {
    if (isPartOfCurrentDrag(piece)) {
      piecesBeingDragged.push(piece);

      if (dragGroupBoardTop !== undefined && dragGroupBoardLeft !== undefined) {
        // If the piece is on the board, set the dragGroupBoardTop variable to be whichever is smaller:
        // the top of the current piece, or the previously set dragGroupBoardTop variable.
        // This determines the top of the drag group.
        // (Do the same for the left.)
        // If the piece is not on the board, set the dragGroupBoardTop/Left to undefined,
        // which will short circuit this block in the future.
        if (piece.boardTop !== undefined) {
          dragGroupBoardTop = Math.min(dragGroupBoardTop, piece.boardTop);
          dragGroupBoardLeft = Math.min(dragGroupBoardLeft, piece.boardLeft);
        } else {
          dragGroupBoardTop = undefined;
          dragGroupBoardLeft = undefined;
          if (piece.poolIndex !== undefined) {
            dragPoolIndex = Math.min(dragPoolIndex, piece.poolIndex);
          }
        }
      }
    } else {
      piecesNotBeingDragged.push(piece);
    }
  }

  return {
    piecesNotBeingDragged,
    piecesBeingDragged,
    dragGroupBoardTop,
    dragGroupBoardLeft,
    dragPoolIndex,
  };
}

function getDragPointerOffset<T extends PieceInGame | PieceInCustom>({
  previousDragState,
  dragGroupBoardTop,
  dragGroupBoardLeft,
  currentPieces,
  gridSize,
  piecesBeingDragged,
  pointerStartPosition,
}: {
  previousDragState?: DragState | undefined;
  dragGroupBoardTop: number | undefined;
  dragGroupBoardLeft: number | undefined;
  currentPieces: T[];
  gridSize: number;
  piecesBeingDragged: T[];
  pointerStartPosition: Position; // the x and y position of the pointer, as captured by the pointer down event
}): Position | null {
  let pointerOffset: Position;
  if (
    previousDragState?.pieceIDs.length == 1 &&
    dragGroupBoardTop !== undefined &&
    dragGroupBoardLeft !== undefined
  ) {
    // If we were previously just dragging one piece and have now potentially expanded to drag multiple pieces,
    // use previous pointerOffset, adjusted for the different group of pieces we have now.
    const previousPiece = currentPieces.filter(
      (piece) => piece.id == previousDragState.pieceIDs[0],
    )[0] as PieceInBoard; // typecasting to narrow from Piece to PieceInBoard since only pieces in the board are part of a multi-drag
    const extraSquaresLeft = previousPiece.boardLeft - dragGroupBoardLeft;
    const extraSquaresTop = previousPiece.boardTop - dragGroupBoardTop;
    const boardRect = document.getElementById("board").getBoundingClientRect(); // todo later should use ref and pass board rect to this function instead
    const squareWidth = (boardRect.width - 1) / gridSize;
    const squareHeight = (boardRect.height - 1) / gridSize;
    pointerOffset = {
      x: previousDragState.pointerOffset.x + squareWidth * extraSquaresLeft,
      y: previousDragState.pointerOffset.y + squareHeight * extraSquaresTop,
    };
  } else {
    // Find the top left of the group in client coordinates, to get pointerOffset.
    const rectangles = piecesBeingDragged.flatMap((piece) => {
      const element = document.getElementById(`piece-${piece.id}`); // todo later should use ref and pass this value to this function instead?
      if (!element) {
        console.warn(
          `dragStart: element for piece ${piece.id} not found in DOM`,
        );
        return [];
      }
      return [element.getBoundingClientRect()];
    });
    if (rectangles.length === 0) {
      return null;
    }
    const dragGroupTop = Math.min(...rectangles.map((rect) => rect.top));
    const dragGroupLeft = Math.min(...rectangles.map((rect) => rect.left));
    pointerOffset = {
      x: pointerStartPosition.x - dragGroupLeft,
      y: pointerStartPosition.y - dragGroupTop,
    };
  }

  return pointerOffset;
}

// We let the pointer wander a few pixels before setting dragHasMoved.
function pointerHasMovedQ(start: Position, pointer: Position): boolean {
  const NOT_FAR = 9.0; // pixels
  return Math.hypot(pointer.x - start.x, pointer.y - start.y) > NOT_FAR;
}

function updateStateForDragEndNotInCustomCreating<S extends GameState>(
  currentState: S,
): S {
  if (currentState.dragState === undefined) {
    console.warn("dragEnd called with no dragState");
    return currentState;
  }

  const destination = currentState.dragState.destination;
  const draggedPieceIDs = currentState.dragState.pieceIDs;
  let mapper;
  if (destination.where === "board") {
    mapper = (piece: PieceInGame): PieceInGame =>
      draggedPieceIDs.includes(piece.id)
        ? ({
            ...piece,
            boardTop: destination.top + (piece as PieceInDrag).dragGroupTop,
            boardLeft: destination.left + (piece as PieceInDrag).dragGroupLeft,
            dragGroupTop: undefined,
            dragGroupLeft: undefined,
          } as PieceInBoard)
        : piece;
  } else {
    let poolIndex = destination.index;
    mapper = (piece: PieceInGame): PieceInGame =>
      draggedPieceIDs.includes(piece.id)
        ? ({
            ...piece,
            poolIndex: poolIndex++,
            dragGroupTop: undefined,
            dragGroupLeft: undefined,
          } as PieceInPool)
        : piece.poolIndex !== undefined && piece.poolIndex >= destination.index
        ? {...piece, poolIndex: piece.poolIndex + draggedPieceIDs.length}
        : piece;
  }
  return updateCompletionState({
    ...currentState,
    pieces: currentState.pieces.map(mapper),
    dragState: undefined,
  });
}

function updateStateForDragEndInCustomCreating(
  currentState: CustomCreationState,
): CustomCreationState {
  if (currentState.dragState === undefined) {
    console.warn("dragEnd called with no dragState");
    return currentState;
  }

  const destination = currentState.dragState.destination;
  const origin = currentState.dragState.origin;
  const draggedPieceIDs = currentState.dragState.pieceIDs;
  const newPieces: PieceInCustom[] = [];
  if (destination.where === "board") {
    let maxID = Math.max(...currentState.pieces.map((piece) => piece.id));

    // Any letters dropped on the board will overwrite anything at that position
    // (this is a deviation from the standard game)
    const overwrittenPositions: [number, number][] = [];
    for (const piece of currentState.pieces) {
      if (draggedPieceIDs.includes(piece.id)) {
        overwrittenPositions.push([
          destination.top + (piece as PieceInCustomDrag).dragGroupTop,
          destination.left + (piece as PieceInCustomDrag).dragGroupLeft,
        ]);
      }
    }

    for (const piece of currentState.pieces) {
      if (draggedPieceIDs.includes(piece.id)) {
        newPieces.push({
          ...piece,
          boardTop: destination.top + (piece as PieceInCustomDrag).dragGroupTop,
          boardLeft:
            destination.left + (piece as PieceInCustomDrag).dragGroupLeft,
          dragGroupTop: undefined,
          dragGroupLeft: undefined,
          poolIndex: undefined,
        });

        // If dragging from pool to board, also add a replacement to the pool
        if (origin.where === "pool") {
          maxID++;
          newPieces.push({
            ...piece,
            dragGroupTop: undefined,
            dragGroupLeft: undefined,
            boardTop: undefined,
            boardLeft: undefined,
            poolIndex: origin.index,
            id: maxID,
          });
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
  }
  // If dragging from board to pool, clear the piece from the board but don't add it to the pool
  else if (destination.where === "pool" && origin.where === "board") {
    for (const piece of currentState.pieces) {
      if (draggedPieceIDs.includes(piece.id)) {
        continue;
      } else if (piece.letters[0][0] !== "") {
        newPieces.push(piece);
      }
    }
  }
  // If dragging from pool to pool, readd the piece to the pool at its original position
  // (and get rid of the empty placeholder piece)
  else if (destination.where === "pool" && origin.where === "pool") {
    for (const piece of currentState.pieces) {
      if (draggedPieceIDs.includes(piece.id)) {
        newPieces.push({
          ...piece,
          poolIndex: origin.index,
          dragGroupTop: undefined,
          dragGroupLeft: undefined,
          boardTop: undefined,
          boardLeft: undefined,
        });
      } else if (piece.letters[0][0] !== "") {
        newPieces.push(piece);
      }
    }
  }

  return {
    ...currentState,
    pieces: newPieces,
    dragState: undefined,
  };
}

export function dragReducer<S extends GameState | CustomCreationState>(
  currentState: S,
  payload: DragReducerPayload,
): S {
  if (payload.action === "dragStart") {
    const {pieceID, pointerID, pointerStartPosition} = payload;
    return updateStateForDragStart({
      currentState,
      isPartOfCurrentDrag: (piece) => piece.id === pieceID,
      pointerID,
      pointerStartPosition,
      boardIsShifting: false,
    });
  } else if (payload.action === "dragNeighbors") {
    // Fired when the timer fires, if `!dragHasMoved`
    // Drop the current piece, then pick up it and all connected pieces
    const {dragState} = currentState;
    if (dragState?.pieceIDs.length !== 1) {
      return currentState;
    }

    const droppedGameState = (
      currentState.isCustomCreating
        ? updateStateForDragEndInCustomCreating(currentState)
        : updateStateForDragEndNotInCustomCreating(currentState)
    ) as S;

    const connectedPieceIDs = getConnectedPieceIDs({
      pieces: droppedGameState.pieces,
      gridSize: droppedGameState.gridSize,
      draggedPieceID: dragState.pieceIDs[0],
    });

    return updateStateForDragStart<S>({
      currentState: droppedGameState,
      isPartOfCurrentDrag: (piece) => connectedPieceIDs.includes(piece.id),
      pointerID: dragState.pointerID,
      pointerStartPosition: dragState.pointer,
      boardIsShifting: false,
      previousDragState: dragState,
    });
  } else if (payload.action === "dragMove") {
    // Fired on pointermove and on lostpointercapture.
    const prevDrag = currentState.dragState;
    if (prevDrag === undefined) {
      return currentState;
    }
    const {pointer, destination} = payload;
    return {
      ...currentState,
      dragState: {
        ...prevDrag,
        pointer,
        destination: destination ?? prevDrag.destination,
        dragHasMoved:
          prevDrag.dragHasMoved ||
          pointerHasMovedQ(prevDrag.pointerStartPosition, pointer),
      },
    };
  } else if (payload.action === "dragEnd") {
    // Fired on lostpointercapture, after `dragMove`.
    //
    // Drop all dragged pieces to `destination` and clear `dragState`.
    if (currentState.isCustomCreating) {
      return updateStateForDragEndInCustomCreating(currentState) as S;
    } else {
      return updateStateForDragEndNotInCustomCreating(currentState) as S;
    }
  } else if (payload.action === "shiftStart") {
    // Fired on pointerdown in an empty square on the board.
    //
    // Initializes `dragState`. Starts a drag on all pieces that are on the board.
    // Sets `destination` to where they currently are.
    const {pointerID, pointerStartPosition} = payload;
    return updateStateForDragStart({
      currentState,
      isPartOfCurrentDrag: (piece) => piece.boardTop !== undefined,
      pointerID,
      pointerStartPosition,
      boardIsShifting: true,
    });
  } else {
    console.log(
      `unknown action: ${(payload as unknown as {action: string}).action}`,
    );
    return currentState;
  }
}
