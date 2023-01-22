export default function getPatternsForRow(grid, rowIndex, minLength) {
  let patterns = [];
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
    for (
      let currentPosition = startPosition;
      currentPosition < row.length;
      currentPosition++
    ) {
      if (
        !row[currentPosition].match("^[A-Z]$") &&
        grid?.[rowIndex - 1]?.[currentPosition]
      ) {
        break;
      }
      if (
        !row[currentPosition].match("^[A-Z]$") &&
        grid?.[rowIndex + 1]?.[currentPosition]
      ) {
        break;
      }
      // Add the element to the pattern
      const element = row[currentPosition].match("^[A-Z]$")
        ? row[currentPosition]
        : "[A-Z]";
      pattern += element;

      if (row[currentPosition].match("^[A-Z]$")) {
        includesLetter = true;
      }

      if (
        !(
          // don't push the pattern if any of these cases are true
          // no letters
          (
            !includesLetter ||
            // less than minLength
            currentPosition - startPosition < minLength ||
            // the next element is a letter
            row[currentPosition + 1]?.match("^[A-Z]$")
          )
        )
      ) {
        patterns.push([pattern, startPosition]);
      }
    }
  }
  return patterns;
}
