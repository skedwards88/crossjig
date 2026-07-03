import {transposeGrid} from "@skedwards88/word_logic";

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
  const transposedGrid = transposeGrid(grid);

  return [
    ...getHorizontalWordsFromGrid(grid),
    ...getHorizontalWordsFromGrid(transposedGrid),
  ];
}
