import { gameInit } from "./gameInit";
import sendAnalytics from "../common/sendAnalytics";
import { gameSolvedQ } from "./gameSolvedQ";

function getPieceIDGrid(pieces, gridSize) {
  // at each space in the grid, find the ID of the piece at that space, if any

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

function giveHint(currentGameState) {
  const pieces = JSON.parse(JSON.stringify(currentGameState.pieces));
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
  const allPiecesAreUsed =
    currentGameState.pieces.filter((piece) => piece.poolIndex >= 0).length ===
    0;

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

function shiftPieces({
  pieces,
  pieceIDsToShift,
  rowShift,
  colShift,
  gridSize,
}) {
  let shiftedPieces = JSON.parse(JSON.stringify(pieces));

  for (const pieceID of pieceIDsToShift) {
    const piece = shiftedPieces[pieceID];
    const pieceBoardTop = piece.boardTop || 0;
    const pieceBoardLeft = piece.boardLeft || 0;
    // return early with the unchanged pieces if any piece would go off board
    if (
      pieceBoardTop + rowShift < 0 ||
      pieceBoardLeft + colShift < 0 ||
      pieceBoardTop + piece.letters.length + rowShift > gridSize ||
      pieceBoardLeft + piece.letters[0].length + colShift > gridSize
    ) {
      return pieces;
    }
    piece.boardTop = pieceBoardTop + rowShift;
    piece.boardLeft = pieceBoardLeft + colShift;
  }
  return shiftedPieces;
}

export function gameReducer(currentGameState, payload) {
  console.log(payload.action);
  if (payload.action === "newGame") {
    return gameInit({ ...payload, seed: undefined, useSaved: false });
  } else if (payload.action === "getHint") {
    sendAnalytics("hint");

    const newPieces = giveHint(currentGameState);

    const completionData = getCompletionData({
      ...currentGameState,
      pieces: newPieces,
    });

    return {
      ...currentGameState,
      pieces: newPieces,
      hintTally: currentGameState.hintTally + 1,
      ...completionData,
    };
  } else if (payload.action === "multiSelect") {
    // if the drag is already started, don't multiselect unless the drag has not moved (return early)
    if (
      currentGameState.dragData?.isDragging &&
      currentGameState.dragData?.dragHasMoved
    ) {
      return currentGameState;
    }

    const connectedPieceIDs = getConnectedPieceIDs({
      pieces: currentGameState.pieces,
      gridSize: currentGameState.gridSize,
      draggedPieceID: payload.pieceID,
    });

    return {
      ...currentGameState,
      dragData: {
        ...currentGameState.dragData,
        connectedPieceIDs,
      },
    };
  } else if (payload.action === "endMultiSelect") {
    // if we are in the middle of a drag, don't clear unless the drag has not moved (return early)
    if (
      currentGameState.dragData?.isDragging &&
      currentGameState.dragData?.dragHasMoved
    ) {
      return currentGameState;
    }
    return {
      ...currentGameState,
      dragData: {},
    };
  } else if (payload.action === "startDrag") {
    // store drag data in the game state
    // since drag event data is only available to
    // the drag start and drop events (not drag enter)
    return {
      ...currentGameState,
      dragData: {
        ...currentGameState.dragData,
        isDragging: true,
        dragHasMoved: false,
        pieceID: payload.pieceID,
        dragArea: payload.dragArea,
        relativeTop: payload.relativeTop,
        relativeLeft: payload.relativeLeft,
        boardLeft: payload.boardLeft,
        boardTop: payload.boardTop,
      },
    };
  } else if (
    payload.action === "dropOnPool" ||
    payload.action === "dragOverPool"
  ) {
    const dragData = currentGameState.dragData;

    // if dragging a blank space from the pool, return early
    if (dragData.pieceID === undefined) {
      return currentGameState;
    }

    // if dragging multiple pieces, return early
    if (dragData.connectedPieceIDs) {
      return currentGameState;
    }

    let newPieces = JSON.parse(JSON.stringify(currentGameState.pieces));
    const allPoolIndexes = newPieces
      .filter((i) => i.poolIndex >= 0)
      .map((i) => i.poolIndex);
    const maxPoolIndex = allPoolIndexes.reduce(
      (currentMax, comparison) =>
        currentMax > comparison ? currentMax : comparison,
      0
    );

    // if dragging pool to pool and dropping on another piece,
    // swap the positions of those pieces
    if (dragData.dragArea === "pool" && payload.targetPieceID) {
      const oldPoolIndex = newPieces[dragData.pieceID].poolIndex;
      const newPoolIndex = newPieces[payload.targetPieceID].poolIndex;
      newPieces[dragData.pieceID].poolIndex = newPoolIndex;
      newPieces[payload.targetPieceID].poolIndex = oldPoolIndex;
    }
    // // if dragging pool to pool and dropping at end,
    // // move the piece to the end and downshift everything that was after
    else if (dragData.dragArea === "pool" && !payload.targetPieceID) {
      for (let index = 0; index < newPieces.length; index++) {
        const piece = newPieces[index];
        if (piece.poolIndex > newPieces[dragData.pieceID].poolIndex) {
          piece.poolIndex = piece.poolIndex - 1;
        }
      }
      newPieces[dragData.pieceID].poolIndex = maxPoolIndex;
    }
    // if dragging board to pool and dropping at end,
    // just add the piece to the end
    else if (dragData.dragArea === "board" && !payload.targetPieceID) {
      newPieces[dragData.pieceID].poolIndex = allPoolIndexes.length
        ? maxPoolIndex + 1
        : 0;
    }
    // if dragging board to pool and dropping on another piece,
    // insert the piece and upshift everything after
    else if (dragData.dragArea === "board" && payload.targetPieceID) {
      const newPoolIndex = newPieces[payload.targetPieceID].poolIndex;
      for (let index = 0; index < newPieces.length; index++) {
        const piece = newPieces[index];
        if (piece.poolIndex >= newPoolIndex) {
          piece.poolIndex = piece.poolIndex + 1;
        }
      }
      newPieces[dragData.pieceID].poolIndex = newPoolIndex;
    }

    newPieces[dragData.pieceID].boardTop = undefined;
    newPieces[dragData.pieceID].boardLeft = undefined;

    // still update the completion data in case the game was complete and now is not due to dragging from board to pool
    const completionData = getCompletionData({
      ...currentGameState,
      pieces: newPieces,
    });

    return {
      ...currentGameState,
      pieces: newPieces,
      dragData:
        payload.action === "dropOnPool"
          ? {}
          : { ...dragData, dragHasMoved: true },
      ...completionData,
    };
  }

  // if dragging a blank spot on the board
  else if (
    currentGameState.dragData.pieceID === undefined &&
    (payload.action === "dragOverBoard" || payload.action === "dropOnBoard")
  ) {
    let pieceIDsToShift = currentGameState.pieces
      .filter((piece) => piece.boardTop >= 0 && piece.boardLeft >= 0)
      .map((piece) => piece.id);

    if (!pieceIDsToShift.length) {
      // return early if the board is empty
      return currentGameState;
    }

    const dragData = currentGameState.dragData;
    const oldRowIndex = dragData.boardTop || 0;
    const newRowIndex = payload.dropRowIndex;
    const rowShift = newRowIndex - oldRowIndex;
    const oldColIndex = dragData.boardLeft || 0;
    const newColIndex = payload.dropColIndex;
    const colShift = newColIndex - oldColIndex;

    const shiftedPieces = shiftPieces({
      pieces: JSON.parse(JSON.stringify(currentGameState.pieces)),
      pieceIDsToShift,
      rowShift,
      colShift,
      gridSize: currentGameState.gridSize,
    });

    return {
      ...currentGameState,
      pieces: shiftedPieces,
      dragData:
        payload.action === "dropOnBoard"
          ? {}
          : {
              ...dragData,
              dragHasMoved: true,
              boardTop: payload.dropRowIndex,
              boardLeft: payload.dropColIndex,
            },
    };
  }

  // dragging/dropping a piece over the board
  else if (
    currentGameState.dragData.pieceID !== undefined &&
    (payload.action === "dragOverBoard" || payload.action === "dropOnBoard")
  ) {
    const dragData = currentGameState.dragData;

    const rowShift = payload.dropRowIndex - (dragData.boardTop || 0);
    const colShift = payload.dropColIndex - (dragData.boardLeft || 0);

    const shiftedPieces = shiftPieces({
      pieces: JSON.parse(JSON.stringify(currentGameState.pieces)),
      pieceIDsToShift: currentGameState.dragData.connectedPieceIDs || [
        dragData.pieceID,
      ],
      rowShift,
      colShift,
      gridSize: currentGameState.gridSize,
    });

    if (payload.action === "dropOnBoard") {
      shiftedPieces[dragData.pieceID].poolIndex = undefined;
    }

    const completionData = getCompletionData({
      ...currentGameState,
      pieces: shiftedPieces,
    });

    return {
      ...currentGameState,
      pieces: shiftedPieces,
      dragData:
        payload.action === "dropOnBoard"
          ? {}
          : {
              ...dragData,
              boardTop: payload.dropRowIndex,
              boardLeft: payload.dropColIndex,
              dragHasMoved: true,
            },
      ...completionData,
    };
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
