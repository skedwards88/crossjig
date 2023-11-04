function getHorizontalWordsFromGrid(grid) {
  let words = [];

  for (const row of grid) {
    let word = "";
    for (const letter of row) {
      if (letter != "") {
        word += letter;
      } else {
        if (word.length > 1) {
          words.push(word);
        }
        word = "";
      }
    }
    // Also push the word if we reach the end of the row
    if (word.length > 1) {
      words.push(word);
    }
  }

  return words;
}

export function getWordsFromGrid(grid) {
  if (grid.length != grid[0]?.length) {
    throw new Error(
      `The number of columns and number of rows in the grid must be equal.`
    );
  }

  const numColumnsPerRow = grid.map((row) => row.length);
  if (Math.min(...numColumnsPerRow) != Math.max(...numColumnsPerRow)) {
    throw new Error(`All of the rows in the grid must have the same length.`);
  }

  const transposedGrid = grid.map((_, index) => grid.map((row) => row[index]));

  return [
    ...getHorizontalWordsFromGrid(grid),
    ...getHorizontalWordsFromGrid(transposedGrid),
  ];
}
