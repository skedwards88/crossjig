import {getGridFromPieces} from "./getGridFromPieces";
import {getWordsFromGrid} from "./getWordsFromGrid";

export function getWordsFromPieces({pieces, gridSize, solution}) {
  const grid = getGridFromPieces({pieces, gridSize, solution});

  const words = getWordsFromGrid(grid);

  return words;
}
