export function inferEventsToLog(oldState, newState) {
  let analyticsToLog = [];

  if (oldState.seed !== newState.seed) {
    analyticsToLog.push({
      eventName: "new_game",
      eventInfo: {
        isDaily: newState.isDaily,
        isCustom: newState.isCustom,
        numLetters: newState.numLetters,
      },
    });
  }

  if (newState.numHints > oldState.numHints) {
    analyticsToLog.push({eventName: "hint"});
  }

  if (newState.gameIsSolved && !oldState.gameIsSolved) {
    analyticsToLog.push({
      eventName: "completed_game",
      eventInfo: {
        numLetters: newState.numLetters,
        isDaily: newState.isDaily,
        isCustom: newState.isCustom,
        numHints: newState.hintTally,
      },
    });
  }

  return analyticsToLog;
}
