import { getSolutionFromPieces } from "./getSolutionFromPieces";
import { getWordsFromGrid } from "./getWordsFromGrid";

export function getWordsFromPieces({ pieces, gridSize }) {
  const grid = getSolutionFromPieces({ pieces, gridSize });

  const words = getWordsFromGrid(grid);

  return words;
}
