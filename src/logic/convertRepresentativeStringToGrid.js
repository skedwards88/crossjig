import {arrayToGrid} from "./arrayToGrid";
import {cipherLetter} from "./cipherLetter";

// Converts a string of letters and integers into a square grid of single letters and empty strings.
// The first character in the string represents how much the letters in the string have been shifted in the alphabet.
// Integers (excluding the first character) in the string are expanded into an equivalent number of empty strings.
// Letters in the string are capitalized and shifted in the alphabet by the amount described by the first character.
export function convertRepresentativeStringToGrid(string) {
  // error if the string includes anything other than letters and numbers
  if (!/^[a-zA-Z0-9]+$/.test(string)) {
    throw new Error(
      "Input string must only contain letters and numbers, and must not be empty",
    );
  }

  // error if the first character is not an integer
  if (!/^\d+$/.test(string[0])) {
    throw new Error("First character in input string must be an integer that represents the cipher shift");
  }

  // The first character in the string is the cipher shift; the rest is the grid representation
  const cipherShift = parseInt(string[0]);
  const representativeString = string.slice(1);

  // Convert the string to a list of stringified integers and single letters
  // e.g. "2A11GT1" becomes ['2', 'A', '11','G', 'T', '1','1']
  const splitString = representativeString.match(/\d+|[a-zA-Z]/gi);

  // Expand the stringified integers in the list to an equal number of empty strings
  // Also capitalize the letters
  let list = [];
  for (const value of splitString) {
    if (/[a-zA-Z]/.test(value)) {
      const decipheredLetter = cipherLetter(value.toUpperCase(), cipherShift);
      list.push(decipheredLetter);
    } else {
      const numSpaces = parseInt(value);
      list = [...list, ...Array(numSpaces).fill("")];
    }
  }

  // Error if the list does not form a square grid between 8x8 and 12x12
  const dimension = Math.sqrt(list.length);
  if (dimension % 1 !== 0) {
    throw new Error("Input string does not form a square grid");
  }
  if (dimension < 8 || dimension > 12) {
    throw new Error("dimension Input string must form a grid between 8x8 and 12x12");
  }

  // I'm assuming that people won't build custom query strings outside of the UI,
  // so I don't need to remove whitespace from the edges or center the grid.
  // (Since this is done when the custom query is generated via the UI.)
  // By this same logic, I'm not validating that the puzzle consists of known words.

  const grid = arrayToGrid(list);
  return grid;
}
