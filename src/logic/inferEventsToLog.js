export function inferEventsToLog(oldState, newState) {
  let analyticsToLog = [];

  if (oldState.seed !== newState.seed) {
    analyticsToLog.push({
      eventName: "new_game",
      eventInfo: {
        isDaily: newState.isDaily,
        isCustom: newState.isCustom,
        isAdventure: newState.isAdventure,
        numLetters: newState.numLetters,
      },
    });
  }

  if (newState.hintTally > oldState.hintTally) {
    analyticsToLog.push({eventName: "hint"});
  }

  if (
    newState.isAdventure &&
    oldState.isAdventure &&
    newState.currentLevel > oldState.currentLevel
  ) {
    analyticsToLog.push({
      eventName: "adventure_level_complete",
      eventInfo: {
        level: oldState.currentLevel + 1, // +1 because level is 0-indexed
      },
    });
  }

  if (
    newState.isAdventure &&
    oldState.isAdventure &&
    newState.adventureComplete &&
    !oldState.adventureComplete
  ) {
    analyticsToLog.push({
      eventName: "adventure_level_complete",
      eventInfo: {
        level: oldState.currentLevel + 1, // +1 because level is 0-indexed
      },
    });

    analyticsToLog.push({
      eventName: "adventure_complete",
      eventInfo: {
        totalHints: oldState.totalHints,
      },
    });
  }

  if (newState.gameIsSolved && !oldState.gameIsSolved) {
    analyticsToLog.push({
      eventName: "completed_game",
      eventInfo: {
        isDaily: newState.isDaily,
        isCustom: newState.isCustom,
        isAdventure: newState.isAdventure,
        numLetters: newState.numLetters,
        numHints: newState.hintTally,
      },
    });
  }

  return analyticsToLog;
}
