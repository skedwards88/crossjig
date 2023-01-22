import { isKnown } from "./isKnown";

function getSurroundingLetterIndexes({
  startingIndex,
  grid,
  alreadyFoundIndexes,
}) {
  const surroundingIndexes = [
    [startingIndex[0] - 1, startingIndex[1]],
    [startingIndex[0] + 1, startingIndex[1]],
    [startingIndex[0], startingIndex[1] - 1],
    [startingIndex[0], startingIndex[1] + 1],
  ];

  let surroundingLetterIndexes = [];
  for (let index = 0; index < surroundingIndexes.length; index++) {
    // If there is a letter at the surrounding index
    if (grid?.[surroundingIndexes[index][0]]?.[surroundingIndexes[index][1]]) {
      // and if the surrounding index was not found already
      if (
        !alreadyFoundIndexes.some(
          (alreadyFoundIndex) =>
            alreadyFoundIndex[0] === surroundingIndexes[index][0] &&
            alreadyFoundIndex[1] === surroundingIndexes[index][1]
        )
      ) {
        surroundingLetterIndexes.push(surroundingIndexes[index]);
      }
    }
  }
  return surroundingLetterIndexes;
}

function isSingleGroupingQ(grid) {
  const numLetters = grid.flatMap((i) => i).filter((i) => i).length;

  // start at any index with a letter
  // recursively, check top,bottom,left,right of the letter for any connected letter
  // to generate a list of all of the letters that are connected
  // then compare with the indexes of all the letters to make sure the same
  let startingIndex;
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
      if (grid[rowIndex][colIndex]) {
        startingIndex = [rowIndex, colIndex];
        break;
      }
    }
    if (startingIndex) {
      break;
    }
  }
  let connectionsToCheckForConnections = getSurroundingLetterIndexes({
    startingIndex: startingIndex,
    grid: grid,
    alreadyFoundIndexes: [startingIndex],
  });
  let connectedIndexes = [startingIndex, ...connectionsToCheckForConnections];

  let count = 0;
  while (connectionsToCheckForConnections.length && count < 100) {
    count++;
    let surroundingIndex = connectionsToCheckForConnections.pop();
    const newSurroundingIndexes = getSurroundingLetterIndexes({
      startingIndex: surroundingIndex,
      grid: grid,
      alreadyFoundIndexes: connectedIndexes,
    });
    connectionsToCheckForConnections = [
      ...connectionsToCheckForConnections,
      ...newSurroundingIndexes,
    ];
    connectedIndexes = [...connectedIndexes, ...newSurroundingIndexes];
  }

  return numLetters === connectedIndexes.length;
}

export function crosswordValidQ({ grid }) {
  const isSingleGrouping = isSingleGroupingQ(grid);
  if (!isSingleGrouping) {
    return {
      gameIsSolved: false,
      reason: `All of the letters must connect`,
    };
  }

  const transposedGrid = grid.map((_, index) => grid.map((row) => row[index]));
  const jointGrid = [...grid, ...transposedGrid];
  for (let rowIndex = 0; rowIndex < jointGrid.length; rowIndex++) {
    let currentWord = "";
    for (
      let characterIndex = 0;
      characterIndex < jointGrid[rowIndex].length;
      characterIndex++
    ) {
      let character = jointGrid[rowIndex][characterIndex];
      // If a letter, append to current word
      if (character.match("^[A-Z]$")) {
        currentWord += character;
      }

      // if the word is complete (either we are at the end of the row or at a non-letter)
      // and longer than one letter
      // then
      // verify the word
      if (
        currentWord &&
        (characterIndex === jointGrid[rowIndex].length - 1 ||
          !character.match("^[A-Z]$"))
      ) {
        if (currentWord.length > 1) {
          const { isWord } = isKnown(currentWord);
          if (!isWord) {
            return {
              gameIsSolved: false,
              reason: `Unknown word ${currentWord}`,
            };
          }
        }

        currentWord = "";
      }
    }
  }
  return { gameIsSolved: true, reason: "" };
}
