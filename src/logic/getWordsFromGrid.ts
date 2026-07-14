import {transposeGrid} from "@skedwards88/word_logic";
import type {LetterOrEmpty} from "../Types";

function getHorizontalWordsFromGrid(grid: LetterOrEmpty[][]): string[] {
  const words = [];

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

export function getWordsFromGrid(grid: LetterOrEmpty[][]): string[] {
  const transposedGrid = transposeGrid(grid);

  return [
    ...getHorizontalWordsFromGrid(grid),
    ...getHorizontalWordsFromGrid(transposedGrid),
  ];
}
