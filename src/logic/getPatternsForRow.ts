import type {LetterOrEmpty} from "../Types";

export default function getPatternsForRow(
  grid: LetterOrEmpty[][],
  rowIndex: number,
  minLength: number,
): [string, number][] {
  // For a specified row in the grid,
  // get the regex patterns that could make a new word in that row
  // in the form [[pattern, column index where pattern starts],...]
  const patterns: [string, number][] = [];
  const row = grid[rowIndex];

  for (
    let startPosition = 0;
    startPosition < row.length - minLength + 1;
    startPosition++
  ) {
    // If the previous element was a letter, skip
    if (row[startPosition - 1]?.match("^[A-Za-z]$")) {
      continue;
    }
    let pattern = "";
    let includesLetter = false;
    let includesWild = false;
    for (
      let currentPosition = startPosition;
      currentPosition < row.length;
      currentPosition++
    ) {
      if (
        // If there isn't a letter at this position
        // and there is a letter above or below this position,
        // stop building the pattern
        !row[currentPosition].match("^[A-Za-z]$") &&
        (grid?.[rowIndex - 1]?.[currentPosition] ||
          grid?.[rowIndex + 1]?.[currentPosition])
      ) {
        break;
      }

      // Add the element to the pattern
      // (the current letter if there is one, otherwise any letter)
      const element = row[currentPosition].match("^[A-Za-z]$")
        ? row[currentPosition]
        : "[A-Za-z]";
      pattern += element;

      // Record whether the pattern includes a letter or wild
      if (element === "[A-Za-z]") {
        includesWild = true;
      } else {
        includesLetter = true;
      }

      if (
        !(
          // don't push the pattern if any of these cases are true:
          // no letters in the pattern
          (
            !includesLetter ||
            // no wild in the pattern
            !includesWild ||
            // less than minLength
            currentPosition - startPosition + 1 < minLength ||
            // the next element is a letter
            row[currentPosition + 1]?.match("^[A-Za-z]$")
          )
        )
      ) {
        patterns.push([pattern, startPosition]);
      }
    }
  }
  return patterns;
}
