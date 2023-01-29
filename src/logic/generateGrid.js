import getPatternsForRow from "./getRegexForRow.js";
import { shuffleArray } from "@skedwards88/word_logic";
import {
  commonWordsLen4,
  commonWordsLen5,
  commonWordsLen6,
  commonWordsLen7,
} from "@skedwards88/word_lists";

function removeWordThatMatches(pattern, wordList) {
  // Given a patten and a list of words, finds a word that matches the pattern
  // and returns the word and the list with the word deleted
  // If no match was found, returns undefined and the unchanged wordlist
  const wordIndex = wordList.findIndex((word) => word.match(`^${pattern}$`));

  if (wordIndex > -1) {
    const word = wordList[wordIndex];
    const newWordList = [
      ...wordList.slice(0, wordIndex),
      ...wordList.slice(wordIndex + 1, wordList.length),
    ];

    return [word, newWordList];
  } else {
    return [undefined, wordList];
  }
}

export function generateGrid({
  gridSize,
  minLetters,
}) {
  const minWordLength = 4;
  let wordList = shuffleArray([
    ...commonWordsLen4,
    ...commonWordsLen5,
    ...commonWordsLen6,
    ...commonWordsLen7,
  ]);

  let letterCount = 0;
  let grid;
  let orientationIsRows;

  while (letterCount < minLetters) {
    let count = 0;
    grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => "")
    );
    orientationIsRows = true;

    //
    // Initialize the grid with a random word at a random position
    //
    let startingWord;
    [startingWord, wordList] = removeWordThatMatches(".+", wordList);
    letterCount = startingWord.length;
    const startingRowIndex = Math.floor(Math.random() * gridSize);
    const startingColIndex = Math.floor(
      Math.random() * (gridSize - startingWord.length)
    );
    for (
      let index = startingColIndex;
      index < startingColIndex + startingWord.length;
      index++
    ) {
      grid[startingRowIndex][index] = startingWord[index - startingColIndex];
    }
    // solution.push({
    //   word: startingWord,
    //   colIndex: startingColIndex,
    //   rowIndex: startingRowIndex,
    //   orientationIsRows: orientationIsRows,
    // });

    //
    // Use this inner loop with the safeguard to let us short circuit if we aren't finding anything
    //
    while (letterCount < minLetters && count < 20) {
      // transpose the grid to start searching in the opposite orientation
      grid = grid.map((_, index) => grid.map((row) => row[index]));
      orientationIsRows = !orientationIsRows;

      // to keep the puzzle spread out and to be more likely to find a match,
      // prefer to add a word to a row that has fewer letters
      let rowIndexesByCounts = grid
        .map((row, index) => [row.filter((i) => i).length, index]) // get array like [[letterCount, rowIndex],...]
        .filter((i) => i[0]) // toss out the rows with letterCount of 0
        .sort((a, b) => a[0] - b[0]) // sort in order of lowest to highest letter count
        .map((countAndIndex) => countAndIndex[1]); // just care about the indexes

      for (
        let metaIndex = 0;
        metaIndex < rowIndexesByCounts.length;
        metaIndex++
      ) {
        let matchingWord;
        let startPosition;
        // Get each regex pattern along with the starting index for the pattern
        const patterns = getPatternsForRow(
          grid,
          rowIndexesByCounts[metaIndex],
          minWordLength
        );
        for (
          let patternIndex = 0;
          patternIndex < patterns.length;
          patternIndex++
        ) {
          let pattern;
          [pattern, startPosition] = patterns[patternIndex];
          [matchingWord, wordList] = removeWordThatMatches(pattern, wordList);

          if (matchingWord) {
            // inject the word into the grid
            for (
              let index = startPosition;
              index < startPosition + matchingWord.length;
              index++
            ) {
              grid[rowIndexesByCounts[metaIndex]][index] =
                matchingWord[index - startPosition];
            }
            // solution.push({
            //   word: matchingWord,
            //   colIndex: startPosition,
            //   rowIndex: rowIndexesByCounts[metaIndex],
            //   orientationIsRows: orientationIsRows,
            // });
            break;
          }
        }
        if (matchingWord) {
          break;
        }
      }

      count++;

      letterCount = grid.reduce(
        (accumulator, row) => accumulator + row.join("").length,
        0
      );
    }
  }
  return grid;
}
