// Converts a 1D array to a 2D square array
export function arrayToGrid(array) {
  // Error if array length does not allow for a square grid
  if (!Number.isInteger(Math.sqrt(array.length))) {
    throw new Error("Array length cannot form a square grid");
  }

  const gridSize = Math.sqrt(array.length);
  let grid = [];
  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    const start = rowIndex * gridSize;
    const end = start + gridSize;
    const row = array.slice(start, end);
    grid.push(row);
  }
  return grid;
}
