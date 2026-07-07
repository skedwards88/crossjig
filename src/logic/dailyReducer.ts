import type {DayNumber, GameStateDaily, Stats} from "../Types";
import {gameInit} from "./gameInit";
import {gameReducer, type GameReducerPayload} from "./gameReducer";
import {
  isYesterday,
  isToday,
} from "@skedwards88/shared-components/src/logic/isNDaysAgo";

function getNewDailyStats(currentGameState: GameStateDaily): Stats | undefined {
  const today = new Date();
  const lastDateWon = currentGameState.stats.lastDateWon;
  const wonYesterday = lastDateWon && isYesterday(lastDateWon);

  // exit early if we already recorded stats for today
  const wonToday = lastDateWon && isToday(lastDateWon);
  if (wonToday) {
    return;
  }

  // If won yesterday, add 1 to the streak
  // Otherwise, reset the streak to 1
  const newStreak = wonYesterday ? currentGameState.stats.streak + 1 : 1;

  const newMaxStreak = Math.max(newStreak, currentGameState.stats.maxStreak);

  // If didn't use any hints today, increment number of wins in the streak without hints
  const hintsUsedToday = currentGameState.hintTally;
  const prevNumHintlessInStreak = wonYesterday
    ? currentGameState.stats.numHintlessInStreak
    : 0;
  const newNumHintlessInStreak = hintsUsedToday
    ? prevNumHintlessInStreak
    : prevNumHintlessInStreak + 1;

  // Tally the number of hints used in the streak
  const prevNumHintsInStreak = wonYesterday
    ? currentGameState.stats.numHintsInStreak
    : 0;
  const newNumHintsInStreak = prevNumHintsInStreak + hintsUsedToday;

  // Update the number of games won for this weekday
  const dayNumber = today.getDay() as DayNumber; // typecast since ts doesn't know that getDay only returns these numbers

  const numWeekdayWon = currentGameState.stats.days[dayNumber].won + 1;

  const numWeekdayWonWithoutHints = hintsUsedToday
    ? currentGameState.stats.days[dayNumber].noHints
    : currentGameState.stats.days[dayNumber].noHints + 1;

  const newDays = {
    ...currentGameState.stats.days,
    [dayNumber]: {won: numWeekdayWon, noHints: numWeekdayWonWithoutHints},
  };

  return {
    ...currentGameState.stats,
    lastDateWon: today.toISOString(),
    streak: newStreak,
    maxStreak: newMaxStreak,
    numHintlessInStreak: newNumHintlessInStreak,
    numHintsInStreak: newNumHintsInStreak,
    days: newDays,
  };
}

export type DailyReducerPayload =
  | GameReducerPayload
  | {
      action: "newGame";
    }
  | {action: "clearStreakIfNeeded"};

export function dailyReducer(
  currentGameState: GameStateDaily,
  payload: DailyReducerPayload,
): GameStateDaily {
  if (payload.action === "newGame") {
    return gameInit({
      useSaved: false,
      isDaily: true,
    });
  } else if (payload.action === "clearStreakIfNeeded") {
    const lastDateWon = currentGameState.stats.lastDateWon;
    const wonYesterday = lastDateWon && isYesterday(lastDateWon);
    const wonToday = lastDateWon && isToday(lastDateWon);

    if (wonYesterday || wonToday) {
      // if won in the past day, don't need to clear the streak
      return currentGameState;
    } else {
      // otherwise clear the streak but leave other stats intact
      const newStats = {
        ...currentGameState.stats,
        streak: 0,
        numHintlessInStreak: 0,
        numHintsInStreak: 0,
      };

      return {
        ...currentGameState,
        stats: newStats,
      };
    }
  } else {
    const updatedState = gameReducer(currentGameState, payload);

    if (updatedState.gameIsSolved && !currentGameState.gameIsSolved) {
      const newStats = getNewDailyStats(currentGameState);
      return {
        ...updatedState,
        ...(newStats && {stats: newStats}),
      } as GameStateDaily;
    } else {
      return updatedState as GameStateDaily;
    }
  }
}
