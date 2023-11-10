import { isAllowedWord } from "./trie";
import { transposeGrid } from "@skedwards88/word_logic";

// Set .lit=true for cells in grid where the letters form a valid word when reading Across.
// (To light up Down words too, this must be called again after transposing the grid.)
function markLitLetters(height, width, grid) {
  for (let row = 0; row < height; row++) {
    let start = undefined;
    let word = "";
    let disqualified = false;
    for (let col = 0; col < width; col++) {
      const square = grid[row][col];
      if (square.letter) {
        if (start == undefined) {
          start = col;
        }
        word += square.letter;
        if (square.count > 1) {
          disqualified = true;
        }
        if (start !== undefined && !grid[row][col + 1]?.count) {
          if (!disqualified && isAllowedWord(word)) {
            for (let lightCol = start; lightCol <= col; lightCol++) {
              grid[row][lightCol].lit = true;
            }
          }
          start = undefined;
          word = "";
          disqualified = false;
        }
      }
    }
  }
}

// Returns a grid with the number of letters at each location in the grid, and optionally
// whether each letter is part of a valid word.
export default function getCountingGrid({height, width, pieces, withLitLetters = false}) {
  let grid = Array(height)
    .fill(undefined)
    .map(() => Array.from({length: width}, () => ({count: 0, letter: "", lit: false})));

  for (let piece of pieces) {
    const letters = piece.letters;
    let top = piece.boardTop ?? piece.groupTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = piece.boardLeft ?? piece.groupLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        const letter = letters[rowIndex][colIndex];
        if (letter) {
          grid[top][left].count++;
          grid[top][left].letter = letter;
        }
        left++;
      }
      top++;
    }
  }

  if (withLitLetters) {
    markLitLetters(height, width, grid);
    grid = transposeGrid(grid);
    markLitLetters(width, height, grid);
    grid = transposeGrid(grid);
  }
  return grid;
}
