import getPatternsForRow from "./getRegexForRow";
import {shuffleArray, transposeGrid} from "@skedwards88/word_logic";
import {
  commonWordsLen4,
  commonWordsLen5,
  commonWordsLen6,
  commonWordsLen7,
} from "@skedwards88/word_lists";
import type {Letter, LetterOrEmpty} from "../Types";
import type seedrandom from "seedrandom";

function removeWordThatMatches(
  pattern: string,
  wordList: string[],
): [string, string[]] | [undefined, string[]] {
  // Given a patten and a list of words, finds a word that matches the pattern
  // and returns the word and the list with the word deleted
  // If no match was found, returns undefined and the unchanged wordlist
  const patternRegExp = new RegExp(`^${pattern}$`);
  const wordIndex = wordList.findIndex((word) => patternRegExp.exec(word));

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
  pseudoRandomGenerator,
}: {
  gridSize: number;
  minLetters: number;
  pseudoRandomGenerator: seedrandom.PRNG;
}): LetterOrEmpty[][] {
  // Generates an interconnected grid of words
  // that fits within the specified gridSize.
  // The total number of letters used will be minLetters or slightly higher.

  const minWordLength = 4;
  let wordList: string[] = shuffleArray(
    [
      ...commonWordsLen4,
      ...commonWordsLen5,
      ...commonWordsLen6,
      ...commonWordsLen7,
    ],
    pseudoRandomGenerator,
  );

  let letterCount = 0;
  let grid: LetterOrEmpty[][] = Array.from({length: gridSize}, () =>
    Array.from({length: gridSize}, () => ""),
  );
  let orientationIsRows;

  while (letterCount < minLetters) {
    // Reinitialize everything in this outer loop in the event that the inner loop short circuited
    let count = 0;
    grid = Array.from({length: gridSize}, () =>
      Array.from({length: gridSize}, () => ""),
    );
    orientationIsRows = true;

    //
    // Initialize the grid with a random word (i.e. the first word from the randomly shuffled word list) at a random position
    //
    let startingWord: string;
    [startingWord, wordList] = [
      wordList[0],
      wordList.slice(1, wordList.length),
    ];
    letterCount = startingWord.length;
    const startingRowIndex = Math.floor(pseudoRandomGenerator() * gridSize);
    const startingColIndex = Math.floor(
      pseudoRandomGenerator() * (gridSize - startingWord.length),
    );
    for (
      let index = startingColIndex;
      index < startingColIndex + startingWord.length;
      index++
    ) {
      grid[startingRowIndex][index] = startingWord[
        index - startingColIndex
      ] as Letter;
    }

    //
    // Use this inner loop with the "count" safeguard to short circuit if it looks like the puzzle hit a dead end
    //
    while (letterCount < minLetters && count < 20) {
      // transpose the grid to start searching in the opposite orientation
      grid = transposeGrid(grid);
      orientationIsRows = !orientationIsRows;

      // to keep the puzzle spread out and to be more likely to find a match,
      // prefer to add a word to a row that has fewer letters
      const rowIndexesByCounts = grid
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
        // Get each regex pattern that could make a new word in the row, along with the starting index for the pattern
        let patterns = getPatternsForRow(
          grid,
          rowIndexesByCounts[metaIndex],
          minWordLength,
        );
        patterns = shuffleArray(patterns, pseudoRandomGenerator);
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
              grid[rowIndexesByCounts[metaIndex]][index] = matchingWord[
                index - startPosition
              ] as Letter;
            }
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
        0,
      );
    }
  }
  return grid;
}
