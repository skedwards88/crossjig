import {generatePuzzle} from "./generatePuzzle";
import {getRandomSeed} from "@skedwards88/shared-components/src/logic/getRandomSeed";
import getDailySeed from "../logic/getDailySeed";
import {getNumLettersForDay} from "./getNumLettersForDay";
import {getGridSizeForLetters} from "./getGridSizeForLetters";
import {generatePuzzleFromRepresentativeString} from "./generatePuzzleFromRepresentativeString";
import {getFromStorage} from "./safeStorage";
import {ADVENTURE_LEVELS, generateAdventurePuzzle} from "./adventure";

function validateSavedState(savedState) {
  if (typeof savedState !== "object" || savedState === null) {
    return false;
  }

  const fieldsAreDefined =
    Array.isArray(savedState.pieces) &&
    savedState.pieces.length > 0 &&
    savedState.gridSize != undefined &&
    savedState.seed != undefined &&
    savedState.numLetters != undefined &&
    savedState.allPiecesAreUsed != undefined &&
    savedState.gameIsSolved != undefined &&
    savedState.gameIsSolvedReason != undefined &&
    (!savedState.isDaily || savedState.stats != undefined) &&
    (!savedState.isAdventure || savedState.currentLevel != undefined) &&
    savedState.hintTally != undefined;

  if (!fieldsAreDefined) {
    return false;
  }

  return true;
}

export function applyBaseState({
  seed,
  puzzle,
  numLetters,
  stats,
  isCustom = false,
  isDaily = false,
  isAdventure = false,
}) {
  return {
    seed,
    ...puzzle,
    numLetters,
    isCustom,
    isDaily,
    isAdventure,
    stats: stats || undefined,
    allPiecesAreUsed: false,
    gameIsSolved: false,
    gameIsSolvedReason: "",
    hintTally: 0,
    dragCount: 0,
    dragState: undefined,
    isResumedFromSave: false,
  };
}

function randomInit({numLetters, useSaved, seed}) {
  if (!seed) {
    seed = getRandomSeed();
  }

  const savedState = useSaved ? getFromStorage("crossjigState") : undefined;

  if (
    savedState &&
    savedState.seed &&
    validateSavedState(savedState) &&
    !savedState.gameIsSolved
  ) {
    return {...savedState, isResumedFromSave: true};
  }

  const minLetters = numLetters || savedState?.numLetters || 30;

  let gridSize = getGridSizeForLetters(minLetters);

  const puzzle = generatePuzzle({
    gridSize,
    minLetters,
    seed,
  });

  return applyBaseState({
    seed,
    puzzle,
    numLetters: minLetters,
  });
}

function dailyInit({useSaved}) {
  const [seed, isCustom] = getDailySeed();

  const savedState = useSaved
    ? getFromStorage("dailyCrossjigState")
    : undefined;

  if (
    savedState &&
    savedState.seed &&
    savedState.seed === seed &&
    validateSavedState(savedState)
  ) {
    return {...savedState, isResumedFromSave: true};
  }

  const minLetters = getNumLettersForDay();

  let gridSize = getGridSizeForLetters(minLetters);

  const puzzle = generatePuzzle({
    gridSize,
    minLetters,
    seed,
  });

  // If there are already stats, use those
  let stats;
  if (savedState && savedState.stats) {
    stats = savedState.stats;
  } else {
    stats = {
      // last puzzle index won (to calculate streak)
      lastDateWon: undefined,
      // consecutive games won
      streak: 0,
      // max consecutive games won
      maxStreak: 0,
      // of streak, games won without hints
      numHintlessInStreak: 0,
      // number of hints used during streak
      numHintsInStreak: 0,
      days: {
        // day: [total number of games won, total number of games won without hints]
        0: {won: 0, noHints: 0}, // Sunday
        1: {won: 0, noHints: 0},
        2: {won: 0, noHints: 0},
        3: {won: 0, noHints: 0},
        4: {won: 0, noHints: 0},
        5: {won: 0, noHints: 0},
        6: {won: 0, noHints: 0},
      },
    };
  }

  return applyBaseState({
    seed,
    puzzle,
    numLetters: minLetters,
    stats,
    isCustom,
    isDaily: true,
  });
}

function customInit({seed, useSaved, numLetters}) {
  let isCustom = true;

  const savedState = useSaved ? getFromStorage("crossjigState") : undefined;

  if (
    savedState &&
    savedState.seed &&
    savedState.seed === seed &&
    validateSavedState(savedState) &&
    !savedState.gameIsSolved
  ) {
    return {...savedState, isResumedFromSave: true};
  }

  // Custom puzzles can exceed the min/max letters used for a randomly generated game. Constrain minLetters in this cases so that future randomly generated games don't use these extreme values.
  const minLetters =
    Math.min(Math.max(numLetters, 20), 60) ||
    Math.min(Math.max(savedState?.numLetters, 20), 60) ||
    30;
  let gridSize = getGridSizeForLetters(minLetters);

  // Attempt to generate the custom puzzle represented by the seed.
  // If any errors are raised, catch them and just generate a random puzzle instead
  let puzzle;
  try {
    puzzle = generatePuzzleFromRepresentativeString({
      representativeString: seed,
    });
  } catch (error) {
    console.error(
      `Error generating custom puzzle from seed ${seed}. Will proceed to generate random game instead. Caught error: ${error}`,
    );

    puzzle = generatePuzzle({
      gridSize,
      minLetters,
      seed,
    });

    isCustom = false;
  }

  return applyBaseState({
    seed,
    puzzle,
    numLetters: minLetters,
    isCustom,
  });
}

function adventureInit({useSaved, seed}) {
  if (useSaved) {
    const savedState = getFromStorage("crossjigAdventureState");

    // If we have valid saved state with the same seed (or any seed if not specified), use it
    if (
      savedState &&
      validateSavedState(savedState) &&
      (!seed || savedState.seed === seed)
    ) {
      return {...savedState, isResumedFromSave: true};
    }
  }

  if (!seed) {
    seed = getRandomSeed();
  }

  const levelIndex = 0;
  const puzzle = generateAdventurePuzzle(levelIndex, seed);

  return {
    ...applyBaseState({
      seed,
      puzzle,
      numLetters: ADVENTURE_LEVELS[levelIndex],
      isAdventure: true,
    }),
    // fields unique to adventure mode:
    currentLevel: levelIndex,
    totalHints: 0,
    adventureComplete: false,
  };
}

export function gameInit({
  numLetters,
  useSaved = true,
  isDaily = false,
  isCustom = false,
  isAdventure = false,
  seed,
}) {
  if (isDaily) {
    return dailyInit({useSaved});
  } else if (isCustom) {
    return customInit({seed, useSaved, numLetters});
  } else if (isAdventure) {
    return adventureInit({useSaved, seed});
  } else {
    return randomInit({numLetters, useSaved, seed});
  }
}
