import sendAnalytics from "../common/sendAnalytics";
import { generatePuzzle } from "./generatePuzzle";

export function gameInit({ numLetters, useSaved = true }) {
  const savedState = useSaved
    ? JSON.parse(localStorage.getItem("crossjigState"))
    : undefined;

  if (
    savedState &&
    savedState.pieces &&
    savedState.gridSize &&
    savedState.numLetters
  ) {
    return savedState;
  }

  const gridSize = 12;
  const minLetters = numLetters || 40;

  const { pieces, maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown } =
    generatePuzzle({ gridSize: gridSize, minLetters: minLetters });

  sendAnalytics("new_game");

  return {
    pieces: pieces,
    gridSize: gridSize,
    numLetters: minLetters,
    maxShiftLeft: maxShiftLeft,
    maxShiftRight: maxShiftRight,
    maxShiftUp: maxShiftUp,
    maxShiftDown: maxShiftDown,
  };
}
