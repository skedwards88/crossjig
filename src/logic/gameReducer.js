import cloneDeep from "lodash.clonedeep";
import { gameInit } from "./gameInit";
import sendAnalytics from "../common/sendAnalytics";
import { gameSolvedQ } from "./gameSolvedQ";

function getPieceIDGrid(pieces, gridSize) {
  // at each space in the grid, find the IDs of the pieces at that space, if any

  let grid = JSON.parse(
    JSON.stringify(Array(gridSize).fill(Array(gridSize).fill([])))
  );

  for (let index = 0; index < pieces.length; index++) {
    if (
      pieces[index].boardTop === undefined &&
      pieces[index].boardLeft === undefined
    ) {
      continue;
    }

    const letters = pieces[index].letters;
    const id = pieces[index].id;
    let top = pieces[index].boardTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = pieces[index].boardLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        if (letters[rowIndex][colIndex]) {
          // to account for overlapping pieces, use array if IDs instead of singleton ID
          grid[top][left].push(id);
        }
        left += 1;
      }
      top += 1;
    }
  }
  return grid;
}

function getConnectedPieceIDs({ pieces, gridSize, draggedPieceID }) {
  // Find all pieces that touch a given piece on the board

  const pieceIDGrid = getPieceIDGrid(pieces, gridSize);

  let touchingIDs = new Set([draggedPieceID]);
  let idsToCheck = [draggedPieceID];
  while (idsToCheck.length) {
    const idToCheck = idsToCheck.pop();
    // For each grid entry, check top/bottom/left/right of grid spaces that contain the current ID
    // If we find a surrounding ID that is not the current ID and we haven't already recorded the ID as touching
    // add the new ID to the list of touching IDs and the list of IDs to check
    for (let rowIndex = 0; rowIndex < pieceIDGrid.length; rowIndex++) {
      for (
        let colIndex = 0;
        colIndex < pieceIDGrid[rowIndex].length;
        colIndex++
      ) {
        if (pieceIDGrid[rowIndex][colIndex].includes(idToCheck)) {
          const surroundingIndexes = [
            [rowIndex - 1, colIndex],
            [rowIndex + 1, colIndex],
            [rowIndex, colIndex - 1],
            [rowIndex, colIndex + 1],
          ];
          for (const [
            surroundingRowIndex,
            surroundingColIndex,
          ] of surroundingIndexes) {
            const neighboringIDs =
              pieceIDGrid?.[surroundingRowIndex]?.[surroundingColIndex] || [];
            if (neighboringIDs.length) {
              neighboringIDs.forEach((neighboringID) => {
                if (
                  !touchingIDs.has(neighboringID) &&
                  neighboringID != idToCheck
                ) {
                  touchingIDs.add(neighboringID);
                  idsToCheck.push(neighboringID);
                }
              });
            }
          }
        }
      }
    }
  }
  return Array.from(touchingIDs);
}

function dragStart({
  currentGameState,
  isPartOfCurrentDrag,
  pointerID,
  pointer,
  pointerOffset,
  isShifting,
}) {
  if (currentGameState.dragState !== undefined) {
    return currentGameState;
  }

  // Find which pieces are selected, which are not, and the top left of the group (in board squares).
  let targets = [];
  let nontargets = [];
  let groupBoardTop = currentGameState.gridSize;
  let groupBoardLeft = currentGameState.gridSize;
  const poolPieces = currentGameState.pieces.filter(
    (piece) => piece.poolIndex >= 0
  );
  let poolIndex = poolPieces.length;
  for (const piece of currentGameState.pieces) {
    if (isPartOfCurrentDrag(piece)) {
      targets.push(piece);
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
      nontargets.push(piece);
    }
  }
  if (targets.length === 0) {
    return currentGameState;
  }

  // Find the top left of the group in client coordinates, to get pointerOffset.
  if (pointerOffset === undefined) {
    const rectangles = targets.flatMap((piece) => {
      const element = document.getElementById(`piece-${piece.id}`);
      if (!element) {
        console.warn(
          `dragStart: element for piece ${piece.id} not found in DOM`
        );
        return [];
      }
      return [element.getBoundingClientRect()];
    });
    if (rectangles.length === 0) {
      return currentGameState;
    }
    const groupTop = Math.min(...rectangles.map((rect) => rect.top));
    const groupLeft = Math.min(...rectangles.map((rect) => rect.left));
    pointerOffset = {
      x: pointer.x - groupLeft,
      y: pointer.y - groupTop,
    };
  }

  currentGameState = {
    ...currentGameState,
    pieces: nontargets.concat(
      targets.map((piece) => ({
        ...piece,
        boardTop: undefined,
        boardLeft: undefined,
        poolIndex: undefined,
        groupTop:
          groupBoardTop === undefined ? 0 : piece.boardTop - groupBoardTop,
        groupLeft:
          groupBoardLeft === undefined ? 0 : piece.boardLeft - groupBoardLeft,
      }))
    ),
    dragCount: currentGameState.dragCount + 1,
    dragState: {
      pieceIDs: targets.map((piece) => piece.id),
      isShifting,
      dragHasMoved: false,
      pointerID,
      pointerStart: pointer,
      pointer,
      pointerOffset,
      destination:
        groupBoardTop !== undefined
          ? { where: "board", top: groupBoardTop, left: groupBoardLeft }
          : { where: "pool", index: poolIndex },
    },
  };

  if (targets.some((piece) => piece.poolIndex !== undefined)) {
    // A piece was removed from the pool, so recompute poolIndex for the other pieces.
    let remainingPoolPieces = currentGameState.pieces.filter(
      (piece) => piece.poolIndex !== undefined
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
          : {
              ...piece,
              poolIndex: poolIndices[piece.id],
            }
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
function hasMoved(start, pointer) {
  const NOT_FAR = 5.0; // pixels
  return Math.hypot(pointer.x - start.x, pointer.y - start.y) > NOT_FAR;
}

function dragEnd(currentGameState) {
  if (currentGameState.dragState === undefined) {
    console.warn("dragEnd called with no dragState");
    return currentGameState;
  }

  const dest = currentGameState.dragState.destination;
  const draggedPieceIDs = currentGameState.dragState.pieceIDs;
  let mapper;
  if (dest.where === "board") {
    mapper = (piece) =>
      draggedPieceIDs.includes(piece.id)
        ? {
            ...piece,
            boardTop: dest.top + piece.groupTop,
            boardLeft: dest.left + piece.groupLeft,
            groupTop: undefined,
            groupLeft: undefined,
          }
        : piece;
  } else {
    let poolIndex = dest.index;
    mapper = (piece) =>
      draggedPieceIDs.includes(piece.id)
        ? {
            ...piece,
            poolIndex: poolIndex++,
            groupTop: undefined,
            groupLeft: undefined,
          }
        : piece.poolIndex !== undefined && piece.poolIndex >= dest.index
        ? { ...piece, poolIndex: piece.poolIndex + draggedPieceIDs.length }
        : piece;
  }
  return updateCompletionState({
    ...currentGameState,
    pieces: currentGameState.pieces.map(mapper),
    dragState: undefined,
  });
}

function giveHint(currentGameState) {
  const pieces = cloneDeep(currentGameState.pieces);
  const { maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown } =
    currentGameState;

  let shiftLeft;
  let shiftUp;
  // check each piece until we find one on the board within the shift range
  for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
    const { boardLeft, boardTop, solutionLeft, solutionTop } =
      pieces[pieceIndex];
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
      const { boardLeft, boardTop, solutionLeft, solutionTop } =
        pieces[pieceIndex];
      // if the piece is not on the board, skip to the next piece
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces = [...realignedPieces, pieces[pieceIndex]];
        continue;
      }
      const newLeft = solutionLeft - shiftLeft;
      const newTop = solutionTop - shiftUp;
      const realignedPiece = {
        ...pieces[pieceIndex],
        boardLeft: newLeft,
        boardTop: newTop,
        poolIndex: undefined,
      };
      realignedPieces = [...realignedPieces, realignedPiece];
      if (boardLeft != newLeft || boardTop != newTop) {
        numRealigned++;
      }
    }
  } else {
    // if didn't find any pieces on the board within the shift range,
    //   move all pieces on the board into place
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      const { boardLeft, boardTop, solutionLeft, solutionTop } =
        pieces[pieceIndex];
      // if the piece is not on the board, skip to the next piece
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces = [...realignedPieces, pieces[pieceIndex]];
        continue;
      }
      const realignedPiece = {
        ...pieces[pieceIndex],
        boardLeft: solutionLeft,
        boardTop: solutionTop,
        poolIndex: undefined,
      };
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
      const { boardLeft, boardTop, solutionLeft, solutionTop } =
        pieces[pieceIndex];
      // if the piece is not on the board, add it to the board and break the loop
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces[pieceIndex] = {
          ...pieces[pieceIndex],
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
    [dayNumber]: { won: numWeekdayWon, noHints: numWeekdayWonWithoutHints },
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
    (piece) => piece.boardTop >= 0 && piece.boardLeft >= 0
  );

  if (!allPiecesAreUsed) {
    return {
      allPiecesAreUsed: false,
      gameIsSolved: false,
      gameIsSolvedReason: "",
    };
  }

  const { gameIsSolved, reason: gameIsSolvedReason } = gameSolvedQ(
    currentGameState.pieces,
    currentGameState.gridSize
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
    ...(newStats && { stats: newStats }),
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
    return gameInit({ ...payload, seed: undefined, useSaved: false });
  } else if (payload.action === "getHint") {
    sendAnalytics("hint");

    const newPieces = giveHint(currentGameState);

    return updateCompletionState({
      ...currentGameState,
      pieces: newPieces,
      hintTally: currentGameState.hintTally + 1,
    });
  } else if (payload.action === "dragStart") {
    // Fired on pointerdown on a piece anywhere.
    // Captures initial `dragState`. `destination` is initialized to where the piece already is.
    const { pieceID, pointerID, pointer, pointerOffset } = payload;
    return dragStart({
      currentGameState,
      isPartOfCurrentDrag: (piece) => piece.id === pieceID,
      pointerID,
      pointer,
      pointerOffset,
      isShifting: false,
    });
  } else if (payload.action === "dragNeighbors") {
    // Fired when the timer fires, if `!dragHasMoved`.
    //
    // Set `piece.isDragging` on all neighbors using `destination` to figure out
    // which pieces are neighbors. Implemented by dropping the current piece, then picking
    // it and all connected pieces up again.
    const { dragState } = currentGameState;
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
      pointerOffset: undefined,
      isShifting: false,
    });
  } else if (payload.action === "dragMove") {
    // Fired on pointermove and on lostpointercapture.
    const prevDrag = currentGameState.dragState;
    if (prevDrag === undefined) {
      return currentGameState;
    }
    const { pointer, destination } = payload;
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
    const { pointerID, pointer } = payload;
    return dragStart({
      currentGameState,
      isPartOfCurrentDrag: (piece) => piece.boardTop !== undefined,
      pointerID,
      pointer,
      pointerOffset: undefined,
      isShifting: true,
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
  } else {
    console.log(`unknown action: ${payload.action}`);
    return currentGameState;
  }
}
