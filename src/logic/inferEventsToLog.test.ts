import type {
  GameStateAdventure,
  GameStateCustom,
  GameStateRandom,
} from "../Types";
import {inferEventsToLog} from "./inferEventsToLog";

describe("inferEventsToLog", () => {
  const genericBase = {
    pieces: [],
    gridSize: 5,
    dragCount: 0,
    seed: "Z",
    maxShiftLeft: 1,
    maxShiftRight: 2,
    maxShiftUp: 3,
    maxShiftDown: 4,
    numLetters: 5,
    allPiecesAreUsed: false,
    gameIsSolved: false,
    gameIsSolvedReason: "",
    hintTally: 3,
    isResumedFromSave: false,
    isDaily: false,
    isCustom: false,
    isAdventure: false,
  };

  test("new_game logged if the seed changes", () => {
    const oldState: GameStateRandom = {
      ...genericBase,
      seed: "A",
      isDaily: false,
      isCustom: false,
      isAdventure: false,
    };

    const newState: GameStateCustom = {
      ...genericBase,
      seed: "B",
      isDaily: false,
      isCustom: true,
      isAdventure: false,
      numLetters: 22,
    };

    expect(inferEventsToLog(oldState, newState)).toStrictEqual([
      {
        eventName: "new_game",
        eventInfo: {
          isDaily: newState.isDaily,
          isCustom: newState.isCustom,
          isAdventure: newState.isAdventure,
          numLetters: newState.numLetters,
        },
      },
    ]);
  });

  test("hint logged if the hint tally increases", () => {
    const oldState: GameStateRandom = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: false, // todo why do I need this is fields? they are already in base
      hintTally: 4,
    };

    const newState: GameStateRandom = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: false,
      hintTally: 5,
    };

    expect(inferEventsToLog(oldState, newState)).toStrictEqual([
      {
        eventName: "hint",
      },
    ]);
  });

  test("hint is not logged if the hint tally decreases", () => {
    const oldState: GameStateRandom = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: false, // todo why do I need this is fields? they are already in base
      hintTally: 5,
    };

    const newState: GameStateRandom = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: false,
      hintTally: 4,
    };

    expect(inferEventsToLog(oldState, newState)).toEqual([]);
  });

  test("adventure_level_complete logged if the both old and new state are adventure, and the adventure level is increased", () => {
    const oldState: GameStateAdventure = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: true,
      currentLevel: 3,
      totalHints: 3,
      adventureComplete: false,
    };

    const newState: GameStateAdventure = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: true,
      currentLevel: 4,
      totalHints: 3,
      adventureComplete: false,
    };

    expect(inferEventsToLog(oldState, newState)).toStrictEqual([
      {
        eventName: "adventure_level_complete",
        eventInfo: {
          level: 4,
        },
      },
    ]);
  });

  test("adventure_level_complete and adventure_complete logged if both the old and new state are adventure, and the adventure becomes complete", () => {
    const oldState: GameStateAdventure = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: true,
      currentLevel: 3,
      totalHints: 3,
      adventureComplete: false,
    };

    const newState: GameStateAdventure = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: true,
      currentLevel: 3,
      totalHints: 3,
      adventureComplete: true,
    };

    expect(inferEventsToLog(oldState, newState)).toStrictEqual([
      {
        eventName: "adventure_level_complete",
        eventInfo: {
          level: 4,
        },
      },
      {
        eventName: "adventure_complete",
        eventInfo: {
          totalHints: 3,
        },
      },
    ]);
  });

  test("adventure_level_complete is not logged if the old and new state is adventure, and the adventure level is decreased (from starting a new adventure)", () => {
    const oldState: GameStateAdventure = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: true,
      currentLevel: 6,
      totalHints: 3,
      adventureComplete: false,
    };

    const newState: GameStateAdventure = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: true,
      currentLevel: 0,
      totalHints: 3,
      adventureComplete: false,
    };

    expect(inferEventsToLog(oldState, newState)).toEqual([]);
  });

  test("completed_game logged if gameIsSolved changes", () => {
    const oldState: GameStateRandom = {
      ...genericBase,
      isDaily: false,
      isCustom: false,
      isAdventure: false,
      gameIsSolved: false,
    };

    const newState: GameStateCustom = {
      ...genericBase,
      isDaily: false,
      isCustom: true,
      isAdventure: false,
      gameIsSolved: true,
    };

    expect(inferEventsToLog(oldState, newState)).toStrictEqual([
      {
        eventName: "completed_game",
        eventInfo: {
          isDaily: newState.isDaily,
          isCustom: newState.isCustom,
          isAdventure: newState.isAdventure,
          numLetters: newState.numLetters,
          numHints: newState.hintTally,
        },
      },
    ]);
  });
});
