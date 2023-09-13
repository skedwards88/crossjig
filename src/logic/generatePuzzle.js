import seedrandom from "seedrandom";
import { generateGrid } from "./generateGrid";
import { centerGrid } from "./centerGrid";
import { getMaxShifts } from "./getMaxShifts";
import { makePieces } from "./makePieces";
import { shuffleArray } from "@skedwards88/word_logic";

export function generatePuzzle({ gridSize, minLetters, seed }) {
  let count = 0;
  let foundPuzzleWithAcceptableSingletons = false;
  const maxFractionSingles = 0.1;

  // Create a new seedable random number generator
  let pseudoRandomGenerator = seed ? seedrandom(seed) : seedrandom();

  while (!foundPuzzleWithAcceptableSingletons) {
    count++;

    // Generate an interconnected grid of words
    const grid = generateGrid({
      gridSize: gridSize,
      minLetters: minLetters,
      pseudoRandomGenerator: pseudoRandomGenerator,
    });

    const centeredGrid = centerGrid(grid);

    const { maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown } =
      getMaxShifts(centeredGrid);

    const pieces = shuffleArray(
      makePieces(centeredGrid),
      pseudoRandomGenerator
    );
    const pieceData = pieces.map((piece, index) => ({
      letters: piece.letters,
      id: index,
      boardTop: undefined,
      boardLeft: undefined,
      poolIndex: index,
      solutionTop: piece.solutionTop,
      solutionLeft: piece.solutionLeft,
    }));

    const numSingletons = pieceData
      .map((piece) => piece.letters)
      .filter(
        (letters) => letters.length === 1 && letters[0].length === 1
      ).length;
    const numPieces = pieceData.length;
    foundPuzzleWithAcceptableSingletons =
      numSingletons / numPieces < maxFractionSingles;

    if (foundPuzzleWithAcceptableSingletons || count > 100) {
      return {
        pieces: pieceData,
        maxShiftLeft: maxShiftLeft,
        maxShiftRight: maxShiftRight,
        maxShiftUp: maxShiftUp,
        maxShiftDown: maxShiftDown,
      };
    }
  }
}
