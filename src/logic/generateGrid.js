import getPatternsForRow from "./getRegexForRow.js";
import { shuffleArray } from "@skedwards88/word_logic";
import {
  commonWordsLen4,
  commonWordsLen5,
  commonWordsLen6,
  commonWordsLen7,
} from "@skedwards88/word_lists";

class WordFinder {
  constructor(wordList) {
    this.wordList = wordList;
    this.minWordLength = 5;
  }

  removeWordThatMatches(pattern) {
    // Given a patten and a list of words, finds a word that matches the pattern.
    // Remove it from the word list and return it.
    // If no match was found, returns undefined
    const patternRegExp = new RegExp(`^${pattern}$`);
    const wordIndex = this.wordList.findIndex((word) =>
      patternRegExp.exec(word)
    );

    if (wordIndex > -1) {
      const word = this.wordList[wordIndex];
      this.wordList[wordIndex] = this.wordList.pop();
      return word;
    } else {
      return undefined;
    }
  }
}

class GridBuilder {
  constructor(gridSize) {
    this.grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => "")
    );
    this.letterCount = 0;
  }

  write(rowIndex, startingColIndex, word) {
    for (let index = 0; index < word.length; index++) {
      if (this.grid[rowIndex][startingColIndex + index] === "") {
        this.letterCount++;
      }
      this.grid[rowIndex][startingColIndex + index] = word[index];
    }
  }

  transpose() {
    // transpose the grid to start searching in the opposite orientation
    this.grid = this.grid.map((_, index) => this.grid.map((row) => row[index]));
  }

  addWordToRow(rowIndex, words, pseudoRandomGenerator) {
    // Get each regex pattern that could make a new word in the row, along with the starting index for the pattern
    let patterns = getPatternsForRow(this.grid, rowIndex, words.minWordLength);
    patterns = shuffleArray(patterns, pseudoRandomGenerator);
    for (let [pattern, startPosition] of patterns) {
      let matchingWord = words.removeWordThatMatches(pattern);
      if (matchingWord) {
        this.write(rowIndex, startPosition, matchingWord);
        return true;
      }
    }
    return false;
  }

  addWordToAnyRow(words, pseudoRandomGenerator) {
    // to keep the puzzle spread out and to be more likely to find a match,
    // prefer to add a word to a row that has fewer letters
    let rowIndexesByCounts = this.grid
      .map((row, index) => [row.filter((i) => i).length, index]) // get array like [[letterCount, rowIndex],...]
      .filter((i) => i[0]) // toss out the rows with letterCount of 0
      .sort((a, b) => a[0] - b[0]) // sort in order of lowest to highest letter count
      .map((countAndIndex) => countAndIndex[1]); // just care about the indexes

    for (const rowIndex of rowIndexesByCounts) {
      if (this.addWordToRow(rowIndex, words, pseudoRandomGenerator)) {
        break;
      }
    }
  }
}

export function generateGrid({ gridSize, minLetters, pseudoRandomGenerator }) {
  // Generates an interconnected grid of words
  // that fits within the specified gridSize.
  // The total number of letters used will be minLetters or slightly higher.

  let words = new WordFinder(
    shuffleArray(
      [
        ...commonWordsLen4,
        ...commonWordsLen5,
        ...commonWordsLen6,
        ...commonWordsLen7,
      ],
      pseudoRandomGenerator
    )
  );

  while (true) {
    let builder = new GridBuilder(gridSize);

    // Initialize the grid with a random word at a random position
    let startingWord = words.removeWordThatMatches(".+");
    const startingRowIndex = Math.floor(pseudoRandomGenerator() * gridSize);
    const startingColIndex = Math.floor(
      pseudoRandomGenerator() * (gridSize - startingWord.length)
    );
    builder.write(startingRowIndex, startingColIndex, startingWord);

    // Use this inner loop with the "count" safeguard to short circuit if it looks like the puzzle hit a dead end
    for (
      let count = 0;
      builder.letterCount < minLetters && count < 20;
      count++
    ) {
      builder.transpose();
      builder.addWordToAnyRow(words, pseudoRandomGenerator);
    }

    if (builder.letterCount >= minLetters) {
      return builder.grid;
    }
  }
}
