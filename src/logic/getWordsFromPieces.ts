import type {PieceWithoutLocation, PieceInBoard} from "../Types";
import type {PieceInCustomBoard} from "./customCreationInit";
import {getGridFromPieces} from "./getGridFromPieces";
import {getWordsFromGrid} from "./getWordsFromGrid";

export function getWordsFromPieces(
  args:
    | {pieces: PieceWithoutLocation[]; gridSize: number; solution: true}
    | {
        pieces: (PieceInBoard | PieceInCustomBoard)[];
        gridSize: number;
        solution: false;
      },
): string[] {
  const grid = getGridFromPieces(args);

  const words = getWordsFromGrid(grid);

  return words;
}
