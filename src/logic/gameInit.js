import sendAnalytics from "../common/sendAnalytics";
import { generatePuzzle } from "./generatePuzzle";

function getRandomSeed() {
  const currentDate = new Date();
  return currentDate.getTime();
}

function getDailySeed() {
  // Get a seed based on today's date 'YYYYMMDD'
  const currentDate = new Date();
  const seed = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${currentDate.getDate().toString().padStart(2, "0")}`;

  return seed;
}

function getNumLettersForDay() {
  const today = new Date().getDay();

  const wordLengths = [
    60, // Sunday
    20,
    25,
    30,
    35,
    40,
    50,
  ];

  return wordLengths[today];
}

export function gameInit({ numLetters, useSaved = true, isDaily = false, seed }) {
  const savedStateName = isDaily ? "dailyCrossjigState" : "crossjigState";

  if (isDaily) {
    seed = getDailySeed()
  }

  if (!seed) {
    seed = getRandomSeed()
  }

  const savedState = useSaved
    ? JSON.parse(localStorage.getItem(savedStateName))
    : undefined;

  if (
    savedState &&
    savedState.seed === seed &&
    savedState.pieces &&
    savedState.gridSize &&
    savedState.numLetters &&
    savedState.allPiecesAreUsed != undefined &&
    savedState.gameIsSolved != undefined &&
    savedState.gameIsSolvedReason != undefined &&
    savedState.stats && 
    savedState.hintTally != undefined &&
    savedState.dragData
  ) {
    return savedState;
  }

  const gridSize = 12;
  const minLetters = isDaily ? getNumLettersForDay() : numLetters || 30;

  const { pieces, maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown } =
    generatePuzzle({ gridSize: gridSize, minLetters: minLetters, seed: seed });

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
        0: { won: 0, noHints: 0 }, // Sunday
        1: { won: 0, noHints: 0 },
        2: { won: 0, noHints: 0 },
        3: { won: 0, noHints: 0 },
        4: { won: 0, noHints: 0 },
        5: { won: 0, noHints: 0 },
        6: { won: 0, noHints: 0 },
      },
    };
  }

  sendAnalytics("new_game");

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
    dragData: {},
  };
}
