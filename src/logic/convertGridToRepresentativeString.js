import {cipherLetter} from "./cipherLetter";

// Converts a 2D grid of letters and spaces into a representative string.
// Spaces are represented by an integer indicating the number of consecutive spaces.
// (Spaces that span rows are considered part of the same consecutive group of spaces.)
// Letters in the string are shifted by the cipherShift amount,
// and the shift amount is prepended to the string.
export function convertGridToRepresentativeString(grid, cipherShift = 0) {
  // Error if cipherShift is not an int between 0 and 9
  if (!Number.isInteger(cipherShift) || cipherShift < 0 || cipherShift > 9) {
    throw new Error("Input cipherShift must be a single digit integer");
  }

  let stringifiedGrid = `${cipherShift}`;
  let spaceCount = 0;

  for (const row of grid) {
    for (const character of row) {
      if (character === "") {
        // If the character is a space, just increase the space count
        spaceCount++;
      } else {
        // Otherwise, add the space count (if it is non-zero) and the letter to the string,
        // and reset the space count
        if (spaceCount) {
          stringifiedGrid += spaceCount;
          spaceCount = 0;
        }
        const cipheredCharacter = cipherLetter(
          character.toUpperCase(),
          -cipherShift,
        );
        stringifiedGrid += cipheredCharacter;
      }
    }
  }

  // If there are trailing spaces, add them to the string
  if (spaceCount) {
    stringifiedGrid += spaceCount;
  }

  return stringifiedGrid;
}
