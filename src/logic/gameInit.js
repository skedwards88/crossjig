import sendAnalytics from "../common/sendAnalytics";
import { generatePuzzle } from "./generatePuzzle";

import {
  commonWordsLen4,
  commonWordsLen5,
  commonWordsLen6,
  commonWordsLen7,
} from "@skedwards88/word_lists";

function getRandomSeed() {
  const currentDate = new Date();
  return currentDate.getTime().toString();
}

export function getDailySeed() {
  // Get a seed based on today's date 'YYYYMMDD'
  const currentDate = new Date();
  const seed = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${currentDate.getDate().toString().padStart(2, "0")}`;

  return seed.toString();
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

export function gameInit({
  numLetters,
  useSaved = true,
  isDaily = false,
  seed,
}) {
  if (!isDaily) {
    const numIterations = 1;
    console.log(`getting data for ${numIterations} puzzles...`);
    let tempStartingWordsInit = [];
    let tempAllWordsInit = [];
    for (let index = 0; index < numIterations; index++) {
      const { tempStartingWordsPuzzle, tempAllWordsPuzzle } = generatePuzzle({
        gridSize: 12,
        minLetters: 40,
        seed: getRandomSeed(),
      });

      tempStartingWordsInit = [
        ...tempStartingWordsInit,
        ...tempStartingWordsPuzzle,
      ];
      tempAllWordsInit = [...tempAllWordsInit, ...tempAllWordsPuzzle];
    }

    const allWords = [
      ...commonWordsLen4,
      ...commonWordsLen5,
      ...commonWordsLen6,
      ...commonWordsLen7,
    ];

    const unusedWords = allWords.filter((i) => !tempAllWordsInit.includes(i));

    // console.log(tempStartingWordsInit)
    // console.log(Array.from(new Set(tempStartingWordsInit)).length)
    // console.log(tempStartingWordsInit.length)
    // console.log(tempAllWordsInit)
    // console.log(Array.from(new Set(tempAllWordsInit)).length)
    // console.log(tempAllWordsInit.length)

    let wordToCount = {};
    for (const word of tempAllWordsInit) {
      wordToCount[word] = wordToCount[word] ? wordToCount[word] + 1 : 1;
    }

    let countToWords = {};
    let countToWords4 = {};
    let countToWords5 = {};
    let countToWords6 = {};
    let countToWords7 = {};
    countToWords["0"] = unusedWords;
    for (const word in wordToCount) {
      const count = wordToCount[word];
      countToWords[count] = countToWords[count]
        ? [...countToWords[count], word]
        : [word];

      switch (word.length) {
        case 4:
          countToWords4[count] = countToWords4[count]
            ? [...countToWords4[count], word]
            : [word];
          break;
        case 5:
          countToWords5[count] = countToWords5[count]
            ? [...countToWords5[count], word]
            : [word];
          break;
        case 6:
          countToWords6[count] = countToWords6[count]
            ? [...countToWords6[count], word]
            : [word];
          break;
        case 7:
          countToWords7[count] = countToWords7[count]
            ? [...countToWords7[count], word]
            : [word];
          break;

        default:
          break;
      }
    }

    for (const word of unusedWords) {
      const count = "0";
      switch (word.length) {
        case 4:
          countToWords4[count] = countToWords4[count]
            ? [...countToWords4[count], word]
            : [word];
          break;
        case 5:
          countToWords5[count] = countToWords5[count]
            ? [...countToWords5[count], word]
            : [word];
          break;
        case 6:
          countToWords6[count] = countToWords6[count]
            ? [...countToWords6[count], word]
            : [word];
          break;
        case 7:
          countToWords7[count] = countToWords7[count]
            ? [...countToWords7[count], word]
            : [word];
          break;

        default:
          break;
      }
    }

    console.log(
      `Words that were present in ${numIterations} puzzles (${
        tempAllWordsInit.length
      } total words, ${
        Array.from(new Set(tempAllWordsInit)).length
      } unique words), in the form {numberOccurrences: words}. ${
        11402 - Array.from(new Set(tempAllWordsInit)).length
      } words were unused.`
    );
    console.log(countToWords);
    // console.log(JSON.stringify(countToWords));

    const replicateCountToWordCount = {};
    for (const replicateCount in countToWords) {
      replicateCountToWordCount[replicateCount] =
        countToWords[replicateCount].length;
    }
    const replicateCountToWordCount4 = {};
    for (const replicateCount in countToWords4) {
      replicateCountToWordCount4[replicateCount] =
        countToWords4[replicateCount].length;
    }
    const replicateCountToWordCount5 = {};
    for (const replicateCount in countToWords5) {
      replicateCountToWordCount5[replicateCount] =
        countToWords5[replicateCount].length;
    }
    const replicateCountToWordCount6 = {};
    for (const replicateCount in countToWords6) {
      replicateCountToWordCount6[replicateCount] =
        countToWords6[replicateCount].length;
    }
    const replicateCountToWordCount7 = {};
    for (const replicateCount in countToWords7) {
      replicateCountToWordCount7[replicateCount] =
        countToWords7[replicateCount].length;
    }

    console.log(JSON.stringify(replicateCountToWordCount));
    console.log(JSON.stringify(replicateCountToWordCount4));
    console.log(JSON.stringify(replicateCountToWordCount5));
    console.log(JSON.stringify(replicateCountToWordCount6));
    console.log(JSON.stringify(replicateCountToWordCount7));
  }

  const savedStateName = isDaily ? "dailyCrossjigState" : "crossjigState";

  if (isDaily) {
    seed = getDailySeed();
  }

  if (!seed) {
    seed = getRandomSeed();
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
