export function getGridFromPieces({ pieces, gridSize, solution }) {
  // Compiles a 2D array representing the letter locations on the board
  // If solution is true, uses the solutionTop/solutionLeft value of each piece
  // otherwise, uses the boardTop/boardLeft value
  if (pieces === undefined) {
    throw new Error("Pieces must be defined.");
  }

  if (gridSize === undefined) {
    throw new Error("Grid size must be defined.");
  }

  let grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => "")
  );

  const topKey = solution ? "solutionTop" : "boardTop";
  const leftKey = solution ? "solutionLeft" : "boardLeft";

  for (const piece of pieces) {
    if (
      !solution &&
      (piece[topKey] == undefined || piece[leftKey] == undefined)
    ) {
      continue;
    }
    const letters = piece.letters;
    let top = piece[topKey];
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = piece[leftKey];
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        if (letters[rowIndex][colIndex]) {
          if (grid[top][left] == undefined) {
            throw new Error("A piece falls outside of the grid boundary.");
          }
          grid[top][left] = letters[rowIndex][colIndex];
        }
        left += 1;
      }
      top += 1;
    }
  }
  return grid;
}
