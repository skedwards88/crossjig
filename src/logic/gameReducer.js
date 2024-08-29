import cloneDeep from "lodash.clonedeep";
import {gameInit} from "./gameInit";
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
  isCustomCreating = false, // (boolean): Whether the player is creating a custom game
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

      if (groupBoardTop !== undefined) {
        // If the piece is on the board, set the groupBoardTop variable to be whichever is smaller:
        // the top of the current piece, or the previously set groupBoardTop variable.
        // This determines the top of the drag group.
        // (Do the same for the left.)
        // If the piece is not on the board, set the groupBoardTop to undefined,
        // which will short circuit this block in the future.
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

  // (For custom creation only)
  // If dragging from the pool, add a dummy placeholder
  let placeholderPoolPieces = [];
  if (isCustomCreating && groupBoardTop === undefined) {
    placeholderPoolPieces = piecesBeingDragged.map((piece) =>
      updatePieceDatum(piece, {
        letters: [[""]],
        id: (piece.id + 1) * -1,
      }),
    );
  }

  currentGameState = {
    ...currentGameState,
    pieces: piecesNotBeingDragged
      .concat(
        piecesBeingDragged.map((piece) =>
          updatePieceDatum(piece, {
            boardTop: undefined,
            boardLeft: undefined,
            poolIndex: undefined,
            dragGroupTop:
              groupBoardTop === undefined ? 0 : piece.boardTop - groupBoardTop,
            dragGroupLeft:
              groupBoardLeft === undefined
                ? 0
                : piece.boardLeft - groupBoardLeft,
          }),
        ),
      )
      .concat(placeholderPoolPieces),
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
          : {where: "pool", index: poolIndex},
      destination:
        groupBoardTop !== undefined
          ? {where: "board", top: groupBoardTop, left: groupBoardLeft}
          : {where: "pool", index: poolIndex},
    }),
  };

  // Don't bother updating the pool index for custom creation since the pool will never be depleted
  if (
    !isCustomCreating &&
    piecesBeingDragged.some((piece) => piece.poolIndex !== undefined)
  ) {
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

function updateStateForCustomDragEnd(currentGameState) {
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
        newPieces.push(
          updatePieceDatum(piece, {
            poolIndex: origin.index,
            dragGroupTop: undefined,
            dragGroupLeft: undefined,
          }),
        );
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

function giveHint(currentGameState) {
  const pieces = cloneDeep(currentGameState.pieces);
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

  let realignedPieces = [];
  let numRealigned = 0;
  // if we found a piece on the board that is within the shift range, realign all other pieces on the board to match if they don't already
  if (shiftLeft != undefined && shiftUp != undefined) {
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      const {boardLeft, boardTop, solutionLeft, solutionTop} =
        pieces[pieceIndex];
      // if the piece is not on the board, skip to the next piece
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces = [...realignedPieces, pieces[pieceIndex]];
        continue;
      }
      const newLeft = solutionLeft - shiftLeft;
      const newTop = solutionTop - shiftUp;
      const realignedPiece = updatePieceDatum(pieces[pieceIndex], {
        boardLeft: newLeft,
        boardTop: newTop,
        poolIndex: undefined,
      });
      realignedPieces = [...realignedPieces, realignedPiece];
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
      const realignedPiece = updatePieceDatum(pieces[pieceIndex], {
        boardLeft: solutionLeft,
        boardTop: solutionTop,
        poolIndex: undefined,
      });
      realignedPieces = [...realignedPieces, realignedPiece];
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
        realignedPieces[pieceIndex] = updatePieceDatum(pieces[pieceIndex], {
          boardLeft: shiftLeft ? solutionLeft - shiftLeft : solutionLeft,
          boardTop: shiftUp ? solutionTop - shiftUp : solutionTop,
          poolIndex: undefined,
        });
        break;
      }
    }
  }

  return realignedPieces;
}

function isYesterday(timestamp) {
  return isNDaysAgo(timestamp, 1);
}

function isToday(timestamp) {
  return isNDaysAgo(timestamp, 0);
}

function isNDaysAgo(timestamp, numberOfDaysAgo) {
  const milliSecPerDay = 24 * 60 * 60 * 1000;
  const previousDay = new Date(Date.now() - numberOfDaysAgo * milliSecPerDay);
  const dateFromTimestamp = new Date(timestamp);

  return (
    dateFromTimestamp.getDate() === previousDay.getDate() &&
    dateFromTimestamp.getMonth() === previousDay.getMonth() &&
    dateFromTimestamp.getFullYear() === previousDay.getFullYear()
  );
}

function getNewDailyStats(currentGameState) {
  const today = new Date();
  const lastDateWon = currentGameState.stats.lastDateWon;
  const wonYesterday = isYesterday(lastDateWon);

  // exit early if we already recorded stats for today
  const wonToday = isToday(lastDateWon);
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
  const dayNumber = today.getDay();

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

  let newStats;
  if (gameIsSolved && !currentGameState.gameIsSolved) {
    sendAnalytics("won");
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

function updateCompletionState(gameState) {
  return {
    ...gameState,
    ...getCompletionData(gameState),
  };
}

export function gameReducer(currentGameState, payload) {
  if (payload.action === "newGame") {
    return gameInit({
      ...payload,
      seed: undefined,
      useSaved: false,
      isCustom: false,
    });
  } else if (payload.action === "playCustom") {
    return gameInit({
      seed: payload.representativeString,
      isCustom: true,
    });
  } else if (payload.action === "getHint") {
    sendAnalytics("hint");

    const newPieces = giveHint(currentGameState);

    return updateCompletionState({
      ...currentGameState,
      pieces: newPieces,
      hintTally: currentGameState.hintTally + 1,
    });
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
    return currentGameState.isCustomCreating
      ? updateStateForCustomDragEnd(currentGameState)
      : updateStateForDragEnd(currentGameState);
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
    const lastDateWon = currentGameState.stats.lastDateWon;
    const wonYesterday = isYesterday(lastDateWon);
    const wonToday = isToday(lastDateWon);

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
    console.log(`unknown action: ${payload.action}`);
    return currentGameState;
  }
}
