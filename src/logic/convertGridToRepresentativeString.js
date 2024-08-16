// todo wip new, incomplete file

// Converts a 2D grid of letters and spaces into a representative string.
// Spaces are represented by an integer indicating the number of consecutive spaces.
// (Spaces that span rows are considered part of the same consecutive group of spaces.)
export function convertGridToRepresentativeString(grid) {
  // validateGrid(grid) todo call this function. include in tests.

  // todo remove whitespace from edges, down to 8x8
  // todo center the grid
  // todo validate that the puzzle consists of known words vert and horiz


  let stringifiedGrid = "";
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
        stringifiedGrid += character;
      }
    }
  }

  // If there are trailing spaces, add them to the string
  if (spaceCount) {
    stringifiedGrid += spaceCount;
  }

  return stringifiedGrid;
}
