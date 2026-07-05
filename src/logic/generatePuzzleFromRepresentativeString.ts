import seedrandom from "seedrandom";
import {makePieces} from "./makePieces";
import {shuffleArray, getMaxShifts} from "@skedwards88/word_logic";
import {convertRepresentativeStringToGrid} from "./convertRepresentativeStringToGrid";
import type {PieceInPool, Puzzle} from "../Types";

export function generatePuzzleFromRepresentativeString({
  representativeString,
}: {
  representativeString: string;
}): Puzzle {
  const pseudoRandomGenerator = seedrandom(representativeString);

  const grid = convertRepresentativeStringToGrid(representativeString);

  const gridSize = grid.length;

  const {maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown} = getMaxShifts(
    grid,
    "",
  );

  const pieces = shuffleArray(makePieces(grid), pseudoRandomGenerator);
  const pieceData: PieceInPool[] = pieces.map((piece, index) => {
    return {
      ...piece,
      poolIndex: index,
      boardTop: undefined,
      boardLeft: undefined,
      dragGroupTop: undefined,
      dragGroupLeft: undefined,
    };
  });

  return {
    pieces: pieceData,
    maxShiftLeft,
    maxShiftRight,
    maxShiftUp,
    maxShiftDown,
    gridSize,
  };
}
