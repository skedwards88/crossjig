import type {GameState, PieceInBoard, PieceInGame} from "../Types";
import {getConnectedPieceIDs} from "./getConnectedPieceIDs";

function pieceToKey(piece: PieceInGame): string {
  return JSON.stringify(piece.letters);
}

// Used to sort duplicate pieces by their distance to the net commonestRealignment
function getDistanceFromRealignment({
  pieceIndex,
  boardTop,
  boardLeft,
  commonestRealignmentTop,
  commonestRealignmentLeft,
  pieces,
  effectiveShiftUp,
  effectiveShiftLeft,
}: {
  pieceIndex: number;
  boardTop: number;
  boardLeft: number;
  commonestRealignmentTop: number;
  commonestRealignmentLeft: number;
  pieces: PieceInGame[];
  effectiveShiftUp: number;
  effectiveShiftLeft: number;
}): number {
  const {solutionTop, solutionLeft} = pieces[pieceIndex];
  return (
    Math.abs(
      commonestRealignmentTop - (boardTop - (solutionTop - effectiveShiftUp)),
    ) +
    Math.abs(
      commonestRealignmentLeft -
        (boardLeft - (solutionLeft - effectiveShiftLeft)),
    )
  );
}

// Pick the most common realignment
// (default to 0 realignment if there weren't realignments)
// In the event of a tie, only one realignment is still returned
function getCommonestRealignment(
  realignments: {
    topDiff: number;
    leftDiff: number;
  }[],
): {commonestRealignmentTop: number; commonestRealignmentLeft: number} {
  let commonestRealignmentTop = 0;
  let commonestRealignmentLeft = 0;
  let highestTally = 0;
  const realignmentTally: Record<
    string,
    {topDiff: number; leftDiff: number; tally: number}
  > = {};

  realignments.forEach(({topDiff, leftDiff}) => {
    const realignmentKey = `${topDiff}|${leftDiff}`;

    const newTally = (realignmentTally[realignmentKey]?.tally ?? 0) + 1;

    if (realignmentTally[realignmentKey]) {
      realignmentTally[realignmentKey].tally = newTally;
    } else {
      realignmentTally[realignmentKey] = {topDiff, leftDiff, tally: newTally};
    }

    if (newTally > highestTally) {
      commonestRealignmentTop = topDiff;
      commonestRealignmentLeft = leftDiff;
      highestTally = newTally;
    }
  });

  return {commonestRealignmentTop, commonestRealignmentLeft};
}

export function giveHint(currentState: GameState): PieceInGame[] {
  const pieces = structuredClone(currentState.pieces);

  const {maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown} = currentState;

  // Group visually identical pieces (jsonifiedLetters: [index...])
  const groupedPieceIndexes: Record<string, number[]> = {};
  pieces.forEach((piece, index) => {
    const key = pieceToKey(piece);
    if (groupedPieceIndexes[key]) {
      groupedPieceIndexes[key].push(index);
    } else {
      groupedPieceIndexes[key] = [index];
    }
  });

  // Check each piece until we find one on the board within the shift range
  // (During realignment, each board piece will be aligned to its official solution adjusted by this shift)
  let shiftLeft: number | undefined;
  let shiftUp: number | undefined;
  outerLoop: for (
    let pieceIndex = 0;
    pieceIndex < pieces.length;
    pieceIndex++
  ) {
    const {boardLeft, boardTop} = pieces[pieceIndex];

    // if the piece is not on the board, skip to the next piece
    if (boardLeft === undefined || boardTop === undefined) {
      continue;
    }

    // if the piece is on the board, check whether it (or any of its duplicates) is within the shift range
    // (i.e. if the diff between the piece's actual position and its official solution position is <= the maximum amount that the official solution can shift)
    // if yes, set the shift and break loop
    for (const duplicatePieceIndex of groupedPieceIndexes[
      pieceToKey(pieces[pieceIndex])
    ]) {
      const {solutionLeft, solutionTop} = pieces[duplicatePieceIndex];

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
        break outerLoop;
      }
    }
  }

  const effectiveShiftLeft = shiftLeft ?? 0;
  const effectiveShiftUp = shiftUp ?? 0;

  // Correctly align the pieces on the board
  const realignedPieces = structuredClone(pieces);

  let numRealigned = 0;

  const realignments: (undefined | {topDiff: number; leftDiff: number})[] = [];

  // ***Mutative function*** (Mutates realignedPieces, numRealigned, realignments)
  // Moves a piece to its official solution position (adjusted by the shift found above),
  // records how far it moved, and tracks whether it actually needed to move.
  // Also clears pool/drag-group placement, which is required
  // when resolving duplicate pieces that were previously sitting in the pool.
  function applyRealignment(
    pieceIndex: number,
    boardLeft: number,
    boardTop: number,
  ): void {
    const {solutionLeft, solutionTop} = pieces[pieceIndex];
    const newLeft = solutionLeft - effectiveShiftLeft;
    const newTop = solutionTop - effectiveShiftUp;

    realignedPieces[pieceIndex] = {
      ...pieces[pieceIndex],
      boardLeft: newLeft,
      boardTop: newTop,
      poolIndex: undefined,
      dragGroupTop: undefined,
      dragGroupLeft: undefined,
    };

    if (boardLeft != newLeft || boardTop != newTop) {
      numRealigned++;
    }

    realignments[pieceIndex] = {
      topDiff: boardTop - newTop,
      leftDiff: boardLeft - newLeft,
    };
  }

  // Will do the duplicate and non-duplicate pieces separately
  const duplicateGroupedIndexes: number[][] = [];

  const nonDuplicateIndexes: number[] = [];

  Object.values(groupedPieceIndexes).forEach((grouping) => {
    if (grouping.length > 1) {
      duplicateGroupedIndexes.push(grouping);
    } else {
      nonDuplicateIndexes.push(grouping[0]);
    }
  });

  // Align the non duplicates first:
  nonDuplicateIndexes.forEach((pieceIndex) => {
    const {boardLeft, boardTop} = pieces[pieceIndex];

    // if the piece is not on the board, skip to the next piece
    if (boardLeft === undefined || boardTop === undefined) {
      return;
    }

    applyRealignment(pieceIndex, boardLeft, boardTop);
  });

  // Then align the duplicates
  duplicateGroupedIndexes.forEach((duplicateGroup) => {
    // Find the duplicates within the duplicate group that are on the board
    const boardPieceIndexes = duplicateGroup.filter(
      (pieceIndex) =>
        pieces[pieceIndex].boardTop != undefined &&
        pieces[pieceIndex].boardLeft != undefined,
    );

    // if none of the pieces in the duplicate group are on the board, continue
    if (boardPieceIndexes.length === 0) {
      return;
    }

    // Otherwise, at least some of the pieces in the duplicate group are on the board.
    // For each one on the board:
    // Choose which realignment to use for comparison:
    //   If the piece is touching other pieces, then use the most common realignment that was applied to the touching pieces
    //   Otherwise choose the most common realignment across all of the non-duplicate board pieces
    // Choose the piece in the duplicate group whose realignment is closest to the chosen realignment
    // (exclude that piece for future cycles)
    // Once all board pieces have been resolved, put the rest in the pool
    const unresolvedDuplicates = structuredClone(duplicateGroup);

    // This is the pool indexes of the pieces in the pool (not the piece indexes of those pieces)
    const poolIndexes = duplicateGroup
      .map((pieceIndex) => realignedPieces[pieceIndex].poolIndex)
      .filter((i) => i != undefined);

    boardPieceIndexes.forEach((boardPieceIndex) => {
      const {boardLeft, boardTop} = pieces[boardPieceIndex] as PieceInBoard;

      const connectedPieceIds = getConnectedPieceIDs({
        pieces,
        gridSize: currentState.gridSize,
        draggedPieceID: pieces[boardPieceIndex].id,
      });

      const {commonestRealignmentTop, commonestRealignmentLeft} =
        getCommonestRealignment(
          connectedPieceIds.length > 1 // connectedPieceIds always includes the input piece
            ? realignments.filter(
                (
                  realignment,
                  index,
                ): realignment is {topDiff: number; leftDiff: number} =>
                  // TS needs this extra hint because it can't handle multiple && in filter
                  realignment != undefined &&
                  connectedPieceIds.includes(pieces[index].id),
              )
            : realignments.filter((realignment) => realignment != undefined),
        );

      // Sort so that the one whose realignment is closest to the net commonestRealignment is first
      unresolvedDuplicates.sort(
        (indexA, indexB) =>
          getDistanceFromRealignment({
            pieceIndex: indexA,
            boardTop,
            boardLeft,
            commonestRealignmentTop,
            commonestRealignmentLeft,
            pieces,
            effectiveShiftUp,
            effectiveShiftLeft,
          }) -
          getDistanceFromRealignment({
            pieceIndex: indexB,
            boardTop,
            boardLeft,
            commonestRealignmentTop,
            commonestRealignmentLeft,
            pieces,
            effectiveShiftUp,
            effectiveShiftLeft,
          }),
      );

      // Remove the best fit from the unresolved group
      const bestFitIndex = unresolvedDuplicates.shift()!;

      applyRealignment(bestFitIndex, boardLeft, boardTop);
    });

    // Move the remaining ones to the pool
    unresolvedDuplicates.forEach((pieceIndex) => {
      realignedPieces[pieceIndex] = {
        ...pieces[pieceIndex],
        boardLeft: undefined,
        boardTop: undefined,
        poolIndex: poolIndexes.shift()!,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
      };
    });
  });

  // if we didn't need to move any pieces that are already on the board, move one new piece onto the board
  if (numRealigned === 0) {
    for (
      let pieceIndex = 0;
      pieceIndex < realignedPieces.length;
      pieceIndex++
    ) {
      const {boardLeft, boardTop, solutionLeft, solutionTop} =
        realignedPieces[pieceIndex];
      // if the piece is not on the board, add it to the board and break the loop
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces[pieceIndex] = {
          ...realignedPieces[pieceIndex],
          boardLeft: solutionLeft - effectiveShiftLeft,
          boardTop: solutionTop - effectiveShiftUp,
          poolIndex: undefined,
          dragGroupTop: undefined,
          dragGroupLeft: undefined,
        };
        break;
      }
    }
  }

  return realignedPieces;
}
