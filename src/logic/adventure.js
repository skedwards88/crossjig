import {gameReducer} from "./gameReducer";
import {generatePuzzle} from "./generatePuzzle";
import {getRandomSeed} from "@skedwards88/shared-components/src/logic/getRandomSeed";
import {getGridSizeForLetters} from "./getGridSizeForLetters";

// Adventure mode: 7 puzzles of increasing size
export const ADVENTURE_LEVELS = [20, 25, 30, 35, 40, 50, 60];

function generateAdventurePuzzle(levelIndex, seed) {
  const minLetters = ADVENTURE_LEVELS[levelIndex];
  return generatePuzzle({
    gridSize: getGridSizeForLetters(minLetters),
    minLetters,
    seed: `${seed}-level${levelIndex}`,
  });
}

function validateSavedAdventureState(savedState, checkPieces = false) {
  if (typeof savedState !== "object" || savedState === null) {
    return false;
  }

  const fieldsAreDefined =
    savedState.seed !== undefined &&
    savedState.currentLevel !== undefined &&
    Array.isArray(savedState.pieces) &&
    savedState.pieces.length > 0 &&
    savedState.gridSize !== undefined;

  if (!fieldsAreDefined) {
    return false;
  }

  return true;
}

export function adventureInit({useSaved = true, seed} = {}) {
  if (useSaved) {
    const savedState = JSON.parse(
      localStorage.getItem("crossjigAdventureState"),
    );

    // If we have valid saved state with the same seed (or any seed if not specified), use it
    if (
      savedState &&
      validateSavedAdventureState(savedState, true) &&
      (!seed || savedState.seed === seed)
    ) {
      return savedState;
    }

    // Clear any invalid saved state
    localStorage.removeItem("crossjigAdventureState");
  }

  // Generate new adventure
  if (!seed) {
    seed = getRandomSeed();
  }

  const levelIndex = 0;
  const puzzle = generateAdventurePuzzle(levelIndex, seed);

  return {
    seed,
    currentLevel: levelIndex,
    ...puzzle,
    allPiecesAreUsed: false,
    gameIsSolved: false,
    gameIsSolvedReason: "",
    hintTally: 0,
    totalHints: 0,
    dragCount: 0,
    dragState: undefined,
    isAdventure: true,
  };
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
    return adventureInit({
      useSaved: false,
      seed: undefined,
    });
  } else if (payload.action === "nextLevel") {
    return advanceAdventureLevel(currentState);
  } else {
    // Delegate to the standard game reducer for ordinary game actions
    const newState = gameReducer(currentState, payload);
    return {
      ...newState,
      // Preserve adventure-specific fields
      isAdventure: true,
      currentLevel: currentState.currentLevel,
      seed: currentState.seed,
      totalHints:
        payload.action === "getHint"
          ? currentState.totalHints + 1
          : currentState.totalHints,
      adventureComplete: currentState.adventureComplete,
    };
  }
}
