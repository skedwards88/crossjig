export function getSolutionFromPieces({ pieces, gridSize }) {
  if (pieces === undefined) {
    throw new Error("Pieces must be defined.");
  }

  if (gridSize === undefined) {
    throw new Error("Grid size must be defined.");
  }

  let grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => "")
  );

  for (const piece of pieces) {
    const letters = piece.letters;
    let top = piece.solutionTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = piece.solutionLeft;
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
