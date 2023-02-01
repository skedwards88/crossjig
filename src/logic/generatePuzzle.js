import { generateGrid } from "./generateGrid";
import { centerGrid } from "./centerGrid";
import { getMaxShifts } from "./getMaxShifts";
import { makePieces } from "./makePieces";
import { shuffleArray } from "@skedwards88/word_logic";

export function generatePuzzle({ gridSize, minLetters }) {
  // Generate grid with words that are 4-7 letters
  const grid = generateGrid({
    gridSize: gridSize,
    minLetters: minLetters,
  });

  const centeredGrid = centerGrid(grid);

  const { maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown } =
    getMaxShifts(centeredGrid);

  const pieces = shuffleArray(makePieces(centeredGrid));
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
  };
}
