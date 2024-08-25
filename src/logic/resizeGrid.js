import cloneDeep from "lodash.clonedeep";
import {getMaxShifts} from "@skedwards88/word_logic";

// Remove/add empty edge columns or rows to
// get as close as possible to one empty row/column on each edge
// and to center the contents,
// while still keeping the grid square
// and not making the grid smaller than 8x8
export function resizeGrid(grid) {
  if (grid.some((row) => row.length != grid.length)) {
    throw new Error("Input grid is not square");
  }

  let paddedGrid = cloneDeep(grid);

  // Get the current maximum number of empty columns/rows that are on the edge of the grid
  const {maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown} = getMaxShifts(
    grid,
    "",
  );

  // Get the width/height, not counting empty rows/cols on the edge
  const usedWidth = grid.length - maxShiftLeft - maxShiftRight;
  const usedHeight = grid[0].length - maxShiftUp - maxShiftDown;

  // The optimum dimension is 1 empty row/col on each side
  // but extra will be added to keep the grid square and at least 8x8
  const targetDimension = Math.max(usedHeight + 2, usedWidth + 2, 8);

  // Figure out the number of empty rows/cols on each edge
  const targetPadTop = Math.floor((targetDimension - usedHeight) / 2);
  const targetPadBottom = Math.ceil((targetDimension - usedHeight) / 2);
  const targetPadLeft = Math.floor((targetDimension - usedWidth) / 2);
  const targetPadRight = Math.ceil((targetDimension - usedWidth) / 2);

  if (targetPadTop < maxShiftUp) {
    // trim top
    paddedGrid.splice(0, maxShiftUp - targetPadTop);
  } else {
    // or pad
    const newRows = Array.from({length: targetPadTop - maxShiftUp}, () =>
      Array(paddedGrid[0].length).fill(""),
    );
    paddedGrid = [...newRows, ...paddedGrid];
  }

  if (targetPadBottom < maxShiftDown) {
    // trim bottom
    paddedGrid.splice(-(maxShiftDown - targetPadBottom));
  } else {
    // or pad
    const newRows = Array.from({length: targetPadBottom - maxShiftDown}, () =>
      Array(paddedGrid[0].length).fill(""),
    );
    paddedGrid = [...paddedGrid, ...newRows];
  }

  if (targetPadLeft < maxShiftLeft) {
    // trim left
    paddedGrid.forEach((row) => row.splice(0, maxShiftLeft - targetPadLeft));
  } else {
    // or pad
    paddedGrid = paddedGrid.map((row) => [
      ...new Array(targetPadLeft - maxShiftLeft).fill(""),
      ...row,
    ]);
  }

  if (targetPadRight < maxShiftRight) {
    // trim right
    paddedGrid.forEach((row) => row.splice(-(maxShiftRight - targetPadRight)));
  } else {
    // or pad
    paddedGrid = paddedGrid.map((row) => [
      ...row,
      ...new Array(targetPadRight - maxShiftRight).fill(""),
    ]);
  }

  return paddedGrid;
}
