import {customDailyPuzzles} from "./customDailyPuzzles";
import {convertRepresentativeStringToGrid} from "./convertRepresentativeStringToGrid";
import {getWordsFromGrid} from "./getWordsFromGrid";
import {isKnown} from "@skedwards88/word_logic";
import {trie} from "../logic/trie";
import {getNumLettersForDay} from "./getNumLettersForDay";

describe("customDailyPuzzles", () => {
  test("All words in the custom daily puzzle must be valid", () => {
    for (const representativeString of Object.values(customDailyPuzzles)) {
      const grid = convertRepresentativeStringToGrid(representativeString);
      const allWords = getWordsFromGrid(grid);
      for (const word of allWords) {
        const {isWord} = isKnown(word, trie);
        if (!isWord) {
          throw new Error(
            `Unknown word ${word} in puzzle ${representativeString}`,
          );
        }
      }
    }
  });

  test("All custom daily puzzles should have an appropriate number of letters for the day", () => {
    for (const [dateString, representativeString] of Object.entries(
      customDailyPuzzles,
    )) {
      const grid = convertRepresentativeStringToGrid(representativeString);
      const numberLetters = grid.flatMap((i) => i).filter((i) => i).length;

      const year = parseInt(dateString.substring(0, 4), 10);
      const month = parseInt(dateString.substring(4, 6), 10) - 1; // Subtract 1 since months are 0-indexed in JS
      const dayOfMonth = parseInt(dateString.substring(6, 8), 10);

      const date = new Date(year, month, dayOfMonth);
      const dayNumber = date.getDay();

      const expectedNumberLetters = getNumLettersForDay(dayNumber);

      const wiggleRoom = 10;

      // Just a warning for now
      if (Math.abs(expectedNumberLetters - numberLetters) > wiggleRoom) {
        console.warn(
          `Custom puzzle for ${dateString} is more than ${wiggleRoom} letters off of the expected number of letters. (Has ${numberLetters}; expected ${expectedNumberLetters} +/ ${wiggleRoom})`,
        );
      }
    }
  });
});
