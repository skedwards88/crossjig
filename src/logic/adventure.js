import {gameInit} from "./gameInit";
import {gameReducer} from "./gameReducer";
import {generatePuzzle} from "./generatePuzzle";
import {getGridSizeForLetters} from "./getGridSizeForLetters";

// Adventure mode: 7 puzzles of increasing size
export const ADVENTURE_LEVELS = [20, 25, 30, 35, 40, 50, 60];

export function generateAdventurePuzzle(levelIndex, seed) {
  const minLetters = ADVENTURE_LEVELS[levelIndex];
  return generatePuzzle({
    gridSize: getGridSizeForLetters(minLetters),
    minLetters,
    seed: `${seed}-level${levelIndex}`,
  });
}

function advanceAdventureLevel(currentState) {
  const nextLevel = currentState.currentLevel + 1;

  if (nextLevel >= ADVENTURE_LEVELS.length) {
    // Adventure complete!
    return {
      ...currentState,
      adventureComplete: true,
    };
  }

  const puzzle = generateAdventurePuzzle(nextLevel, currentState.seed);

  return {
    ...currentState,
    currentLevel: nextLevel,
    ...puzzle,
    allPiecesAreUsed: false,
    gameIsSolved: false,
    gameIsSolvedReason: "",
    hintTally: 0,
    dragCount: 0,
    dragState: undefined,
  };
}

export function adventureReducer(currentState, payload) {
  if (payload.action === "newAdventure") {
    return gameInit({
      useSaved: false,
      seed: undefined,
      isAdventure: true,
    });
  } else if (payload.action === "nextLevel") {
    return advanceAdventureLevel(currentState);
  } else {
    // Delegate to the standard game reducer for ordinary game actions
    const newState = gameReducer(currentState, payload);
    return {
      ...newState,
      totalHints:
        payload.action === "getHint"
          ? currentState.totalHints + 1
          : currentState.totalHints,
    };
  }
}
