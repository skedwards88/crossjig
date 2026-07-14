import seedrandom from "seedrandom";
import {generateGrid} from "./generateGrid";
import {makePieces} from "./makePieces";
import {shuffleArray, centerGrid, getMaxShifts} from "@skedwards88/word_logic";
import type {PieceInPool, Puzzle} from "../Types";

export function generatePuzzle({
  gridSize,
  minLetters,
  seed,
}: {
  gridSize: number;
  minLetters: number;
  seed: string;
}): Puzzle {
  let count = 0;
  let foundPuzzleWithAcceptableSingletons = false;
  const maxFractionSingles = 0.1;

  // Create a new seedable random number generator
  const pseudoRandomGenerator = seed ? seedrandom(seed) : seedrandom();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    count++;

    // Generate an interconnected grid of words
    const grid = generateGrid({
      gridSize: gridSize,
      minLetters: minLetters,
      pseudoRandomGenerator: pseudoRandomGenerator,
    });

    const centeredGrid = centerGrid(grid, "");

    let {maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown} = getMaxShifts(
      centeredGrid,
      "",
    );

    const pieces = shuffleArray(
      makePieces(centeredGrid),
      pseudoRandomGenerator,
    );
    let pieceData: PieceInPool[] = pieces.map((piece, index) => {
      return {
        ...piece,
        poolIndex: index,
        boardTop: undefined,
        boardLeft: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
      };
    });

    const numSingletons = pieceData
      .map((piece) => piece.letters)
      .filter(
        (letters) => letters.length === 1 && letters[0].length === 1,
      ).length;
    const numPieces = pieceData.length;
    foundPuzzleWithAcceptableSingletons =
      numSingletons / numPieces < maxFractionSingles;

    if (foundPuzzleWithAcceptableSingletons || count > 100) {
      // Pad the puzzle with a square on each side and recenter the solution
      maxShiftRight++;
      maxShiftDown++;
      maxShiftLeft++;
      maxShiftUp++;
      gridSize = gridSize + 2;
      pieceData = pieceData.map((piece) => {
        return {
          ...piece,
          solutionTop: piece.solutionTop + 1,
          solutionLeft: piece.solutionLeft + 1,
        };
      });

      return {
        gridSize,
        pieces: pieceData,
        maxShiftLeft: maxShiftLeft,
        maxShiftRight: maxShiftRight,
        maxShiftUp: maxShiftUp,
        maxShiftDown: maxShiftDown,
      };
    }
  }
}
