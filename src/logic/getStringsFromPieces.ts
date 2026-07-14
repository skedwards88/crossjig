import type {PieceWithoutLocation, PieceInGame} from "../Types";
import type {PieceInCustom} from "./customCreationInit";
import {getGridFromPieces} from "./getGridFromPieces";
import {getWordsFromGrid} from "./getWordsFromGrid";

// This function returns the horizontal and vertical strings based on the piece placement in the game or in the official solution.
// It does not validate that the strings are actual words.
export function getStringsFromPieces(
  args:
    | {pieces: PieceWithoutLocation[]; gridSize: number; solution: true}
    | {
        pieces: (PieceInGame | PieceInCustom)[];
        gridSize: number;
        solution: false;
      },
): string[] {
  const grid = getGridFromPieces(args);

  const words = getWordsFromGrid(grid);

  return words;
}
