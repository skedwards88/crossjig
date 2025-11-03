import {generatePuzzle} from "./generatePuzzle";
import {getRandomSeed} from "@skedwards88/shared-components/src/logic/getRandomSeed";
import getDailySeed from "../logic/getDailySeed";
import {getNumLettersForDay} from "./getNumLettersForDay";
import {getGridSizeForLetters} from "./getGridSizeForLetters";
import {generatePuzzleFromRepresentativeString} from "./generatePuzzleFromRepresentativeString";

function validateSavedState(savedState) {
  if (typeof savedState !== "object" || savedState === null) {
    return false;
  }

  const fieldsAreDefined =
    savedState.pieces &&
    savedState.gridSize &&
    savedState.numLetters &&
    savedState.allPiecesAreUsed != undefined &&
    savedState.gameIsSolved != undefined &&
    savedState.gameIsSolvedReason != undefined &&
    savedState.stats &&
    savedState.hintTally != undefined;

  if (!fieldsAreDefined) {
    return false;
  }

  return true;
}

export function gameInit({
  numLetters,
  useSaved = true,
  isDaily = false,
  isCustom = false,
  seed,
}) {
  const savedStateName = isDaily ? "dailyCrossjigState" : "crossjigState";

  if (isDaily) {
    [seed, isCustom] = getDailySeed();
  }

  if (!seed) {
    seed = getRandomSeed();
  }

  const savedState = useSaved
    ? JSON.parse(localStorage.getItem(savedStateName))
    : undefined;

  if (
    savedState &&
    savedState.seed &&
    // Make sure the seed matches (unless this isn't a daily or custom game)
    ((!isDaily && !isCustom) || savedState.seed == seed) &&
    validateSavedState(savedState) &&
    // Use the saved state if daily even if the game is solved
    // otherwise, don't use the saved state if the game is solved
    !(!isDaily && savedState.gameIsSolved)
  ) {
    return {...savedState, analyticsToLog: []};
  }

  let pieces;
  let maxShiftLeft;
  let maxShiftRight;
  let maxShiftUp;
  let maxShiftDown;
  let minLetters = isDaily
    ? getNumLettersForDay()
    : Math.min(Math.max(numLetters, 20), 60) ||
      Math.min(Math.max(savedState?.numLetters, 20), 60) ||
      30; // Custom puzzles can exceed the min/max letters used for a randomly generated game. Constrain minLetters in this cases so that future randomly generated games don't use these extreme values.
  let gridSize = getGridSizeForLetters(minLetters);

  // If custom, attempt to generate the custom puzzle represented by the seed.
  // If any errors are raised, catch them and just generate a random puzzle instead
  if (isCustom) {
    try {
      ({
        gridSize,
        minLetters,
        pieces,
        maxShiftLeft,
        maxShiftRight,
        maxShiftUp,
        maxShiftDown,
      } = generatePuzzleFromRepresentativeString({representativeString: seed}));
    } catch (error) {
      console.error(
        `Error generating custom puzzle from seed ${seed}. Will proceed to generate random game instead. Caught error: ${error}`,
      );

      ({
        gridSize,
        pieces,
        maxShiftLeft,
        maxShiftRight,
        maxShiftUp,
        maxShiftDown,
      } = generatePuzzle({
        gridSize: gridSize,
        minLetters: minLetters,
        seed: seed,
      }));
    }
  } else {
    ({gridSize, pieces, maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown} =
      generatePuzzle({gridSize: gridSize, minLetters: minLetters, seed: seed}));
  }

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

  return {
    seed: seed,
    pieces: pieces,
    gridSize: gridSize,
    numLetters: minLetters,
    maxShiftLeft: maxShiftLeft,
    maxShiftRight: maxShiftRight,
    maxShiftUp: maxShiftUp,
    maxShiftDown: maxShiftDown,
    stats: stats,
    isDaily: isDaily,
    allPiecesAreUsed: false,
    gameIsSolved: false,
    gameIsSolvedReason: "",
    hintTally: 0,
    dragCount: 0,
    dragState: undefined,
    isCustom,
    analyticsToLog: [
      {
        eventName: "new_game",
        eventInfo: {
          isDaily,
          isCustom,
          numLetters,
        },
      },
    ],
  };
}
