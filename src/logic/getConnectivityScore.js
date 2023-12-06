export function getConnectivityScore({ pieces, gridSize }) {
  // Convert the pieces to a grid of bools indicating
  // whether there is a letter at each position in the grid
  let grid = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );
  for (let index = 0; index < pieces.length; index++) {
    const letters = pieces[index].letters;
    let top = pieces[index].solutionTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = pieces[index].solutionLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        if (letters[rowIndex][colIndex]) {
          grid[top][left] = true;
        }
        left += 1;
      }
      top += 1;
    }
  }

  // The connectivity score is the percentage
  // of letters with at least 2 neighbors that are in a different line
  // (e.g.top and right counts, top and bottom does not)
  let numLetters = 0;
  let numLettersWithConnectivity = 0;
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (let colIndex = 0; colIndex < grid[0].length; colIndex++) {
      const isLetter = grid[rowIndex][colIndex];
      if (isLetter) {
        numLetters++;
        const hasRightNeighbor = grid?.[rowIndex + 1]?.[colIndex];
        const hasLeftNeighbor = grid?.[rowIndex - 1]?.[colIndex];
        const hasBottomNeighbor = grid?.[rowIndex]?.[colIndex + 1];
        const hasTopNeighbor = grid?.[rowIndex]?.[colIndex - 1];
        if (
          (hasLeftNeighbor && hasTopNeighbor) ||
          (hasTopNeighbor && hasRightNeighbor) ||
          (hasRightNeighbor && hasBottomNeighbor) ||
          (hasBottomNeighbor && hasLeftNeighbor)
        ) {
          numLettersWithConnectivity++;
        }
      }
    }
  }
  return 100 * (numLettersWithConnectivity / numLetters);
}
