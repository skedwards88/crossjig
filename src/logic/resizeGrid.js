import cloneDeep from "lodash.clonedeep";
import {getMaxShifts} from "@skedwards88/word_logic";

// `grid` starts out as a 12x12 2D array
// Remove or add empty edge columns or rows to get as close as possible to one empty row/column on each edge
// while still keeping the grid square
// and not making the grid smaller than 8x8
export function resizeGrid(grid) {
  let paddedGrid = cloneDeep(grid);

  // Get the current maximum number of empty columns/rows that are on the edge of the grid
  const {maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown} = getMaxShifts(
    grid,
    "",
  );

  //
  const usedWidth = grid.length - maxShiftLeft - maxShiftRight;
  const usedHeight = grid[0].length - maxShiftUp - maxShiftDown;

  const targetDimension = Math.max(usedHeight + 2, usedWidth + 2, 8);

  const targetPadTop = Math.floor((targetDimension - usedHeight) / 2);
  const targetPadBottom = Math.ceil((targetDimension - usedHeight) / 2);
  const targetPadLeft = Math.floor((targetDimension - usedWidth) / 2);
  const targetPadRight = Math.ceil((targetDimension - usedWidth) / 2);

  console.log("maxShiftUp: " + maxShiftUp);
  console.log("maxShiftDown: " + maxShiftDown);
  console.log("usedHeight: " + usedHeight);
  console.log("target: " + targetDimension);
  console.log("targetPadTop: " + targetPadTop);
  console.log("targetPadBottom: " + targetPadBottom);
  console.log("targetPadLeft: " + targetPadLeft);
  console.log("targetPadRight: " + targetPadRight);

  if (targetPadTop < maxShiftUp) {
    // trim
    paddedGrid.splice(0, maxShiftUp - targetPadTop);
  } else {
    // or pad
    paddedGrid = [
      ...Array(targetPadTop - maxShiftUp).fill(
        Array(paddedGrid[0].length).fill(""),
      ),
      ...paddedGrid,
    ];
  }

  if (targetPadBottom < maxShiftDown) {
    // trim
    paddedGrid.splice(-(maxShiftDown - targetPadBottom));
  } else {
    // or pad
    paddedGrid = [
      ...paddedGrid,
      ...Array(targetPadBottom - maxShiftDown).fill(
        Array(paddedGrid[0].length).fill(""),
      ),
    ];
  }

  if (targetPadLeft < maxShiftLeft) {
    // trim
    paddedGrid.forEach((row) => row.splice(0, maxShiftLeft - targetPadLeft));
  } else {
    // or pad
    paddedGrid = paddedGrid.map((row) => [
      ...new Array(targetPadLeft - maxShiftLeft).fill(""),
      ...row,
    ]);
  }

  if (targetPadRight < maxShiftRight) {
    // trim
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
