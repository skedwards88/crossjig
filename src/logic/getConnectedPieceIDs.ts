import type {PieceInGame} from "../Types";
import {type PieceInCustom} from "./customCreationInit";

function getPieceIDGrid(
  pieces: PieceInCustom[] | PieceInGame[],
  gridSize: number,
): number[][][] {
  // at each space in the grid, find the IDs of the pieces at that space, if any

  const grid: number[][][] = Array.from({length: gridSize}, () =>
    Array.from({length: gridSize}, () => []),
  );

  for (let index = 0; index < pieces.length; index++) {
    const piece = pieces[index];
    if (piece.boardTop === undefined || piece.boardLeft === undefined) {
      continue;
    }

    const letters = piece.letters;
    const id = piece.id;
    let top = piece.boardTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = piece.boardLeft;
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

export function getConnectedPieceIDs({
  pieces,
  gridSize,
  draggedPieceID,
}: {
  pieces: PieceInCustom[] | PieceInGame[];
  gridSize: number;
  draggedPieceID: number;
}): number[] {
  // Find all pieces that touch a given piece on the board

  const pieceIDGrid = getPieceIDGrid(pieces, gridSize);

  const touchingIDs = new Set([draggedPieceID]);
  const idsToCheck = [draggedPieceID];
  let idToCheck: number | undefined;
  while ((idToCheck = idsToCheck.pop()) !== undefined) {
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
