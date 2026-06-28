// Returns a grid with the number of letters at each location in the grid
export function getLetterCountPerSquare(height, width, pieces) {
  let grid = Array(height)
    .fill(undefined)
    .map(() => Array(width).fill(0));

  for (let piece of pieces) {
    const letters = piece.letters;
    let top = piece.boardTop ?? piece.dragGroupTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = piece.boardLeft ?? piece.dragGroupLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        if (letters[rowIndex][colIndex]) {
          grid[top][left]++;
        }
        left++;
      }
      top++;
    }
  }
  return grid;
}
