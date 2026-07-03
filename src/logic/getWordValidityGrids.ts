import {getGridFromPieces} from "../logic/getGridFromPieces";
import {getWordsFromPieces} from "../logic/getWordsFromPieces";
import {transposeGrid} from "@skedwards88/word_logic";
import {isKnown} from "@skedwards88/word_logic";
import {trie} from "../logic/trie";

function getHorizontalValidityGrid({grid, originalWords}) {
  // return a 2D array of bools indicating whether
  // the position corresponds to a letter on the board
  // that is part of a valid horizontal word
  const height = grid.length;
  const width = grid[0].length;

  const horizontalValidityGrid = Array(height)
    .fill(undefined)
    .map(() => Array(width).fill(false));

  for (const [rowIndex, row] of grid.entries()) {
    let word = "";
    let indexes = [];
    for (const [columnIndex, letter] of row.entries()) {
      if (letter != "") {
        word += letter;
        indexes.push(columnIndex);
      } else {
        if (word.length > 1) {
          // If the word is one of the original words, always consider it valid (in case we updated the dictionary in the interim).
          // Otherwise, check whether it is a word in the trie.
          let isWord = originalWords.includes(word);
          if (!isWord) {
            ({isWord} = isKnown(word, trie));
          }
          if (isWord) {
            indexes.forEach(
              (index) => (horizontalValidityGrid[rowIndex][index] = true),
            );
          }
        }
        word = "";
        indexes = [];
      }
    }
    // Also end the word if we reach the end of the row
    if (word.length > 1) {
      // If the word is one of the original words, always consider it valid (in case we updated the dictionary in the interim).
      // Otherwise, check whether it is a word in the trie.
      let isWord = originalWords.includes(word);
      if (!isWord) {
        ({isWord} = isKnown(word, trie));
      }
      if (isWord) {
        indexes.forEach(
          (index) => (horizontalValidityGrid[rowIndex][index] = true),
        );
      }
    }
  }

  return horizontalValidityGrid;
}

export function getWordValidityGrids({
  pieces,
  gridSize,
  includeOriginalSolution = true,
}) {
  const originalWords = includeOriginalSolution
    ? getWordsFromPieces({
        pieces,
        gridSize,
        solution: true,
      })
    : [];

  const grid = getGridFromPieces({pieces, gridSize, solution: false});

  const horizontalValidityGrid = getHorizontalValidityGrid({
    grid,
    originalWords,
  });

  const transposedGrid = transposeGrid(grid);
  const horizontalTransposedValidityGrid = getHorizontalValidityGrid({
    grid: transposedGrid,
    originalWords,
  });
  const verticalValidityGrid = transposeGrid(horizontalTransposedValidityGrid);

  return [horizontalValidityGrid, verticalValidityGrid];
}
