import {transposeGrid} from "@skedwards88/word_logic";

export function getMaxShifts(grid) {
  const transposedGrid = transposeGrid(grid);

  let maxShiftUp = 0;
  for (let index = 0; index < grid.length; index++) {
    if (grid[index].every((i) => i === "")) {
      maxShiftUp++;
    } else {
      break;
    }
  }

  let maxShiftDown = 0;
  for (let index = grid.length - 1; index >= 0; index--) {
    if (grid[index].every((i) => i === "")) {
      maxShiftDown++;
    } else {
      break;
    }
  }

  let maxShiftLeft = 0;
  for (let index = 0; index < transposedGrid.length; index++) {
    if (transposedGrid[index].every((i) => i === "")) {
      maxShiftLeft++;
    } else {
      break;
    }
  }

  let maxShiftRight = 0;
  for (let index = transposedGrid.length - 1; index >= 0; index--) {
    if (transposedGrid[index].every((i) => i === "")) {
      maxShiftRight++;
    } else {
      break;
    }
  }

  return {
    maxShiftDown: maxShiftDown,
    maxShiftLeft: maxShiftLeft,
    maxShiftRight: maxShiftRight,
    maxShiftUp: maxShiftUp,
  };
}
