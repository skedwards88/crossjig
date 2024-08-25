import seedrandom from "seedrandom";
import {makePieces} from "./makePieces";
import {shuffleArray, getMaxShifts} from "@skedwards88/word_logic";
import {convertRepresentativeStringToGrid} from "./convertRepresentativeStringToGrid";
import {updatePieceDatum} from "./assemblePiece";

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
  const pieceData = pieces.map((piece, index) =>
    updatePieceDatum(piece, {
      id: index,
      poolIndex: index,
    }),
  );

  return {
    pieces: pieceData,
    maxShiftLeft,
    maxShiftRight,
    maxShiftUp,
    maxShiftDown,
    gridSize,
    minLetters,
  };
}
