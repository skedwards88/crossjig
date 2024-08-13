import seedrandom from "seedrandom";
import {makePieces} from "./makePieces";
import {shuffleArray, getMaxShifts} from "@skedwards88/word_logic";
import {convertRepresentativeStringToGrid} from "./convertRepresentativeStringToGrid";

export function generatePuzzleFromRepresentativeString({representativeString}) {
  const pseudoRandomGenerator = seedrandom(representativeString);

  const grid = convertRepresentativeStringToGrid(representativeString);

  const gridSize = grid.length;
  const minLetters = grid.flat().filter((i) => i).length;

  const {maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown} = getMaxShifts(
    grid,
    "",
  );

  const pieces = shuffleArray(makePieces(grid), pseudoRandomGenerator);
  const pieceData = pieces.map((piece, index) => ({
    letters: piece.letters,
    id: index,
    boardTop: undefined,
    boardLeft: undefined,
    poolIndex: index,
    solutionTop: piece.solutionTop,
    solutionLeft: piece.solutionLeft,
  }));

  return {
    pieces: pieceData,
    maxShiftLeft: maxShiftLeft,
    maxShiftRight: maxShiftRight,
    maxShiftUp: maxShiftUp,
    maxShiftDown: maxShiftDown,
    gridSize,
    minLetters,
  };
}
