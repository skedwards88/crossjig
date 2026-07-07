import type {GameStateAdventure, Puzzle} from "../Types";
import {applyBaseState, gameInit} from "./gameInit";
import {gameReducer, type GameReducerPayload} from "./gameReducer";
import {generatePuzzle} from "./generatePuzzle";
import {getGridSizeForLetters} from "./getGridSizeForLetters";

// Adventure mode: 7 puzzles of increasing size
export const ADVENTURE_LEVELS = [20, 25, 30, 35, 40, 50, 60];

export function generateAdventurePuzzle(
  levelIndex: number,
  seed: string,
): Puzzle {
  const minLetters = ADVENTURE_LEVELS[levelIndex];
  return generatePuzzle({
    gridSize: getGridSizeForLetters(minLetters),
    minLetters,
    seed: `${seed}-level${levelIndex}`,
  });
}

function advanceAdventureLevel(
  currentState: GameStateAdventure,
): GameStateAdventure {
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
    ...applyBaseState({
      seed: currentState.seed,
      puzzle,
      numLetters: ADVENTURE_LEVELS[nextLevel],
      isAdventure: true,
    }),
    // fields unique to adventure mode:
    currentLevel: nextLevel,
    totalHints: currentState.totalHints,
    adventureComplete: false,
  };
}
export type AdventureReducerPayload =
  | GameReducerPayload
  | {
      action: "newAdventure";
    }
  | {
      action: "nextLevel";
    };

export function adventureReducer(
  currentState: GameStateAdventure,
  payload: AdventureReducerPayload,
): GameStateAdventure {
  if (payload.action === "newAdventure") {
    return gameInit({
      useSaved: false,
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
    } as GameStateAdventure;
  }
}
