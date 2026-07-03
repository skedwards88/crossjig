import {gameInit} from "./gameInit";
import {getConnectedPieceIDs} from "./getConnectedPieceIDs";
import {
  isYesterday,
  isToday,
} from "@skedwards88/shared-components/src/logic/isNDaysAgo";
import {
  DragDestination,
  GameState,
  GameStateDaily,
  Position,
  Piece,
  PieceInBoard,
  PieceInDrag,
  PieceInPool,
  DragState,
  Stats,
} from "../Types";
import {gameSolvedQ} from "./gameSolvedQ";

export type GameReducerPayload =
  | {
      action: "newGame";
      isDaily: boolean;
    }
  | {
      action: "newGame";
      numLetters: number;
    }
  | {action: "playCustom"; representativeString: string}
  | {action: "getHint"}
  | {
      action: "dragStart";
      pieceID: number;
      pointerID: number;
      pointerStartPosition: Position;
    }
  | {action: "dragNeighbors"}
  | {action: "dragMove"; pointer: Position; destination: DragDestination}
  | {action: "dragEnd"}
  | {action: "shiftStart"; pointerID: number; pointerStartPosition: Position}
  | {action: "clearStreakIfNeeded"}
  | {action: "updateInvalidReason"; invalidReason: string}
  | {action: "updateRepresentativeString"; representativeString: string};

function updateStateForDragStart({
  currentGameState,
  isPartOfCurrentDrag,
  pointerID,
  pointerStartPosition,
  boardIsShifting,
  previousDragState,
  isCustomCreating = false,
}: {
  currentGameState: GameState;
  isPartOfCurrentDrag: (piece: Piece) => boolean; // function that takes a piece and returns a bool indicating whether the piece is being dragged
  pointerID: number; // the ID of the pointer, as captured by the pointer down event
  pointerStartPosition: Position; // the x and y position of the pointer, as captured by the pointer down event
  boardIsShifting: boolean; // whether the whole board is being dragged
  previousDragState?: DragState;
  isCustomCreating?: boolean; // whether the player is creating a custom game
}): GameState {
  if (currentGameState.dragState !== undefined) {
    console.warn("Tried to start a drag while a drag was in progress");
    return currentGameState;
  }

  const {
    piecesNotBeingDragged,
    piecesBeingDragged,
    dragGroupBoardTop,
    dragGroupBoardLeft,
    dragPoolIndex,
  } = getPiecesBeingDragged({
    currentPieces: currentGameState.pieces,
    gridSize: currentGameState.gridSize,
    isPartOfCurrentDrag,
  });

  if (piecesBeingDragged.length === 0) {
    console.warn("Tried to start a drag but no pieces are being dragged");
    return currentGameState;
  }

  const pointerOffset = getDragPointerOffset({
    previousDragState,
    dragGroupBoardTop,
    dragGroupBoardLeft,
    currentPieces: currentGameState.pieces,
    gridSize: currentGameState.gridSize,
    piecesBeingDragged,
    pointerStartPosition,
  });

  if (pointerOffset === null) {
    return currentGameState;
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

  const newPieces = isCustomCreating
    ? updatePiecesForDragInCustomCreating({
        piecesBeingDragged,
        piecesNotBeingDragged,
        isDraggingFromPool: dragGroupBoardTop === undefined,
        dragGroupBoardTop,
        dragGroupBoardLeft,
      })
    : updatePiecesForDragNotInCustomCreating({
        piecesBeingDragged,
        piecesNotBeingDragged,
        dragGroupBoardTop,
        dragGroupBoardLeft,
      });

  return {
    ...currentGameState,
    pieces: newPieces,
    dragCount: currentGameState.dragCount + 1,
    dragState: newDragState,
    // Clear `gameIsSolved`, but don't recompute the whole completion state. This prevents
    // the `gameIsSolvedReason` from disappearing on each drag when all the pieces are
    // on the board but the puzzle isn't solved yet.
    gameIsSolved: false, // todo only needed if not custom
  };
}

function applyDragToPiecesBeingDragged({
  piecesBeingDragged,
  dragGroupBoardTop,
  dragGroupBoardLeft,
}: {
  piecesBeingDragged: Piece[];
  dragGroupBoardTop: number | undefined;
  dragGroupBoardLeft: number | undefined;
}): PieceInDrag[] {
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
  piecesBeingDragged: Piece[];
  piecesNotBeingDragged: Piece[];
  dragGroupBoardTop: number | undefined;
  dragGroupBoardLeft: number | undefined;
}): Piece[] {
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
    let remainingPoolPieces = newPieces.filter(
      (piece) => piece.poolIndex !== undefined,
    );
    remainingPoolPieces.sort((a, b) => a.poolIndex - b.poolIndex);
    let poolIndices = Array(newPieces.length).fill(-1);
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
  piecesBeingDragged: Piece[];
  piecesNotBeingDragged: Piece[];
  dragGroupBoardTop: number | undefined;
  dragGroupBoardLeft: number | undefined;
  isDraggingFromPool: boolean;
}): Piece[] {
  // (For custom creation only)
  // If dragging from the pool, add a dummy placeholder
  const placeholderPoolPieces: Piece[] = isDraggingFromPool
    ? piecesBeingDragged.map((piece) => {
        return {...piece, letters: [[""]], id: (piece.id + 1) * -1};
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

function getPiecesBeingDragged({
  currentPieces,
  gridSize,
  isPartOfCurrentDrag,
}: {
  currentPieces: Piece[];
  gridSize: number;
  isPartOfCurrentDrag: (piece: Piece) => boolean; // function that takes a piece and returns a bool indicating whether the piece is being dragged
}): {
  piecesNotBeingDragged: Piece[];
  piecesBeingDragged: Piece[];
  dragGroupBoardTop: number | undefined;
  dragGroupBoardLeft: number | undefined;
  dragPoolIndex: number;
} {
  // Find which pieces are selected, which are not, and the top left of the group (in board squares).
  let piecesBeingDragged = [];
  let piecesNotBeingDragged = [];
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

function getDragPointerOffset({
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
  currentPieces: Piece[];
  gridSize: number;
  piecesBeingDragged: Piece[];
  pointerStartPosition: Position; // the x and y position of the pointer, as captured by the pointer down event
}): Position | null {
  let pointerOffset: Position;
  if (
    previousDragState &&
    previousDragState.pieceIDs.length == 1 &&
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

function updateStateForDragEnd(currentGameState: GameState): GameState {
  if (currentGameState.dragState === undefined) {
    console.warn("dragEnd called with no dragState");
    return currentGameState;
  }

  const destination = currentGameState.dragState.destination;
  const draggedPieceIDs = currentGameState.dragState.pieceIDs;
  let mapper;
  if (destination.where === "board") {
    mapper = (piece: Piece) =>
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
    mapper = (piece: Piece) =>
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
    ...currentGameState,
    pieces: currentGameState.pieces.map(mapper),
    dragState: undefined,
  });
}

function updateStateForCustomDragEnd(currentGameState: GameState): GameState {
  if (currentGameState.dragState === undefined) {
    console.warn("dragEnd called with no dragState");
    return currentGameState;
  }

  const destination = currentGameState.dragState.destination;
  const origin = currentGameState.dragState.origin;
  const draggedPieceIDs = currentGameState.dragState.pieceIDs;
  let newPieces: Piece[] = [];
  if (destination.where === "board") {
    let maxID = Math.max(...currentGameState.pieces.map((piece) => piece.id));

    // Any letters dropped on the board will overwrite anything at that position
    // (this is a deviation from the standard game)
    let overwrittenPositions: [number, number][] = [];
    for (const piece of currentGameState.pieces) {
      if (draggedPieceIDs.includes(piece.id)) {
        overwrittenPositions.push([
          destination.top + (piece as PieceInDrag).dragGroupTop,
          destination.left + (piece as PieceInDrag).dragGroupLeft,
        ]);
      }
    }

    for (const piece of currentGameState.pieces) {
      if (draggedPieceIDs.includes(piece.id)) {
        newPieces.push({
          ...piece,
          boardTop: destination.top + (piece as PieceInDrag).dragGroupTop,
          boardLeft: destination.left + (piece as PieceInDrag).dragGroupLeft,
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
    for (const piece of currentGameState.pieces) {
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
    for (const piece of currentGameState.pieces) {
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
    ...currentGameState,
    pieces: newPieces,
    dragState: undefined,
  };
}

function giveHint(currentGameState: GameState): Piece[] {
  const pieces = structuredClone(currentGameState.pieces);
  const {maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown} =
    currentGameState;

  let shiftLeft;
  let shiftUp;
  // check each piece until we find one on the board within the shift range
  for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
    const {boardLeft, boardTop, solutionLeft, solutionTop} = pieces[pieceIndex];
    // if the piece is not on the board, skip to the next piece
    if (boardLeft === undefined || boardTop === undefined) {
      continue;
    }
    // if the piece is on the board, check whether it is within the shift range
    //   if yes, set the shift and break loop
    const actualShiftLeft = solutionLeft - boardLeft;
    const actualShiftUp = solutionTop - boardTop;
    if (
      actualShiftLeft <= maxShiftLeft &&
      actualShiftUp <= maxShiftUp &&
      -1 * actualShiftLeft <= maxShiftRight &&
      -1 * actualShiftUp <= maxShiftDown
    ) {
      shiftLeft = actualShiftLeft;
      shiftUp = actualShiftUp;
      break;
    }
  }

  let realignedPieces: Piece[] = [];
  let numRealigned = 0;
  // if we found a piece on the board that is within the shift range, realign all other pieces on the board to match if they don't already
  if (shiftLeft != undefined && shiftUp != undefined) {
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      const {boardLeft, boardTop, solutionLeft, solutionTop} =
        pieces[pieceIndex];
      // if the piece is not on the board, skip to the next piece
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces.push(pieces[pieceIndex]);
        continue;
      }
      const newLeft = solutionLeft - shiftLeft;
      const newTop = solutionTop - shiftUp;
      const realignedPiece = {
        ...(pieces[pieceIndex] as PieceInBoard),
        boardLeft: newLeft,
        boardTop: newTop,
        poolIndex: undefined,
      };
      realignedPieces.push(realignedPiece);
      if (boardLeft != newLeft || boardTop != newTop) {
        numRealigned++;
      }
    }
  } else {
    // if didn't find any pieces on the board within the shift range,
    //   move all pieces on the board into place
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      const {boardLeft, boardTop, solutionLeft, solutionTop} =
        pieces[pieceIndex];
      // if the piece is not on the board, skip to the next piece
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces = [...realignedPieces, pieces[pieceIndex]];
        continue;
      }
      const realignedPiece = {
        ...(pieces[pieceIndex] as PieceInBoard),
        boardLeft: solutionLeft,
        boardTop: solutionTop,
        poolIndex: undefined,
      };
      realignedPieces.push(realignedPiece);
      if (boardLeft != solutionLeft || boardTop != solutionTop) {
        numRealigned++;
      }
    }
  }

  // if we didn't need to move any pieces that are already on the board, move one new piece onto the board
  if (!numRealigned) {
    realignedPieces = [...pieces];
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      const {boardLeft, boardTop, solutionLeft, solutionTop} =
        pieces[pieceIndex];
      // if the piece is not on the board, add it to the board and break the loop
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces[pieceIndex] = {
          ...(pieces[pieceIndex] as PieceInPool),
          boardLeft: shiftLeft ? solutionLeft - shiftLeft : solutionLeft,
          boardTop: shiftUp ? solutionTop - shiftUp : solutionTop,
          poolIndex: undefined,
        };
        break;
      }
    }
  }

  return realignedPieces;
}

function getNewDailyStats(currentGameState: GameStateDaily): Stats | undefined {
  const today = new Date();
  const lastDateWon = currentGameState.stats.lastDateWon;
  const wonYesterday = lastDateWon && isYesterday(lastDateWon);

  // exit early if we already recorded stats for today
  const wonToday = lastDateWon && isToday(lastDateWon);
  if (wonToday) {
    return;
  }

  // If won yesterday, add 1 to the streak
  // Otherwise, reset the streak to 1
  const newStreak = wonYesterday ? currentGameState.stats.streak + 1 : 1;

  const newMaxStreak = Math.max(newStreak, currentGameState.stats.maxStreak);

  // If didn't use any hints today, increment number of wins in the streak without hints
  const hintsUsedToday = currentGameState.hintTally;
  const prevNumHintlessInStreak = wonYesterday
    ? currentGameState.stats.numHintlessInStreak
    : 0;
  const newNumHintlessInStreak = hintsUsedToday
    ? prevNumHintlessInStreak
    : prevNumHintlessInStreak + 1;

  // Tally the number of hints used in the streak
  const prevNumHintsInStreak = wonYesterday
    ? currentGameState.stats.numHintsInStreak
    : 0;
  const newNumHintsInStreak = prevNumHintsInStreak + hintsUsedToday;

  // Update the number of games won for this weekday
  const dayNumber = today.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6; // typecase since ts doesn't know that getDay only returns these numbers

  const numWeekdayWon = currentGameState.stats.days[dayNumber].won + 1;

  const numWeekdayWonWithoutHints = hintsUsedToday
    ? currentGameState.stats.days[dayNumber].noHints
    : currentGameState.stats.days[dayNumber].noHints + 1;

  const newDays = {
    ...currentGameState.stats.days,
    [dayNumber]: {won: numWeekdayWon, noHints: numWeekdayWonWithoutHints},
  };

  return {
    ...currentGameState.stats,
    lastDateWon: today,
    streak: newStreak,
    maxStreak: newMaxStreak,
    numHintlessInStreak: newNumHintlessInStreak,
    numHintsInStreak: newNumHintsInStreak,
    days: newDays,
  };
}

function getCompletionData(currentGameState: GameState) {
  const allPiecesAreUsed = currentGameState.pieces.every(
    (piece) => piece.boardTop != undefined && piece.boardLeft != undefined,
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

  let newStats;
  if (gameIsSolved && !currentGameState.gameIsSolved) {
    if (currentGameState.isDaily) {
      newStats = getNewDailyStats(currentGameState);
    }
  }

  return {
    allPiecesAreUsed: true,
    gameIsSolved: gameIsSolved,
    gameIsSolvedReason: gameIsSolvedReason,
    ...(newStats && {stats: newStats}),
  };
}

function updateCompletionState(gameState: GameState): GameState {
  return {
    ...gameState,
    ...getCompletionData(gameState),
  };
}

export function gameReducer(
  currentGameState: GameState,
  payload: GameReducerPayload,
): GameState {
  if (payload.action === "newGame") {
    if ("isDaily" in payload && payload.isDaily) {
      // overly verbose checking for TS
      return gameInit({
        isDaily: true,
        useSaved: false,
      });
    } else {
      return gameInit({
        ...("numLetters" in payload && {numLetters: payload.numLetters}), // overly verbose checking for TS
        useSaved: false,
      });
    }
  } else if (payload.action === "playCustom") {
    return gameInit({
      seed: payload.representativeString,
      isCustom: true,
    });
  } else if (payload.action === "getHint") {
    const newPieces = giveHint(currentGameState);

    const updatedState = updateCompletionState({
      ...currentGameState,
      pieces: newPieces,
      hintTally: currentGameState.hintTally + 1,
    });

    return updatedState;
  } else if (payload.action === "dragStart") {
    const {pieceID, pointerID, pointerStartPosition} = payload;
    return updateStateForDragStart({
      currentGameState,
      isPartOfCurrentDrag: (piece) => piece.id === pieceID,
      pointerID,
      pointerStartPosition,
      boardIsShifting: false,
      isCustomCreating: currentGameState.isCustomCreating,
    });
  } else if (payload.action === "dragNeighbors") {
    // Fired when the timer fires, if `!dragHasMoved`
    // Drop the current piece, then pick up it and all connected pieces
    const {dragState} = currentGameState;
    if (dragState === undefined || dragState.pieceIDs.length !== 1) {
      return currentGameState;
    }

    const droppedGameState = currentGameState.isCustomCreating
      ? updateStateForCustomDragEnd(currentGameState)
      : updateStateForDragEnd(currentGameState);

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
      isCustomCreating: currentGameState.isCustomCreating,
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
          prevDrag.dragHasMoved ||
          pointerHasMovedQ(prevDrag.pointerStartPosition, pointer),
      },
    };
  } else if (payload.action === "dragEnd") {
    // Fired on lostpointercapture, after `dragMove`.
    //
    // Drop all dragged pieces to `destination` and clear `dragState`.
    if (currentGameState.isCustomCreating) {
      return updateStateForCustomDragEnd(currentGameState);
    } else {
      const updatedState = updateStateForDragEnd(currentGameState);

      return updatedState;
    }
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
      isCustomCreating: currentGameState.isCustomCreating,
    });
  } else if (payload.action === "clearStreakIfNeeded") {
    if (!currentGameState.isDaily) {
      return currentGameState;
    }

    const lastDateWon = currentGameState.stats.lastDateWon;
    const wonYesterday = lastDateWon && isYesterday(lastDateWon);
    const wonToday = lastDateWon && isToday(lastDateWon);

    if (wonYesterday || wonToday) {
      // if won in the past day, don't need to clear the streak
      return currentGameState;
    } else {
      // otherwise clear the streak but leave other stats intact
      const newStats = {
        ...currentGameState.stats,
        streak: 0,
        numHintlessInStreak: 0,
        numHintsInStreak: 0,
      };

      return {
        ...currentGameState,
        stats: newStats,
      };
    }
  } else if (payload.action === "updateInvalidReason") {
    return {
      ...currentGameState,
      invalidReason: payload.invalidReason,
    };
  } else if (payload.action === "updateRepresentativeString") {
    return {
      ...currentGameState,
      representativeString: payload.representativeString,
    };
  } else {
    console.log(
      `unknown action: ${(payload as unknown as {action: string}).action}`,
    );
    return currentGameState;
  }
}
