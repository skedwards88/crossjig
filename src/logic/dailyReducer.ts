import type {DayNumber, GameStateDaily, Stats} from "../Types";
import {gameInit} from "./gameInit";
import {
  isYesterday,
  isToday,
} from "@skedwards88/shared-components/src/logic/isNDaysAgo";
import {gameReducer, type GameReducerPayload} from "./gameReducer";

function getNewDailyStats(currentState: GameStateDaily): Stats | undefined {
  const today = new Date();
  const lastDateWon = currentState.stats.lastDateWon;
  const wonYesterday = lastDateWon && isYesterday(lastDateWon);

  // exit early if we already recorded stats for today
  const wonToday = lastDateWon && isToday(lastDateWon);
  if (wonToday) {
    return;
  }

  // If won yesterday, add 1 to the streak
  // Otherwise, reset the streak to 1
  const newStreak = wonYesterday ? currentState.stats.streak + 1 : 1;

  const newMaxStreak = Math.max(newStreak, currentState.stats.maxStreak);

  // If didn't use any hints today, increment number of wins in the streak without hints
  const hintsUsedToday = currentState.hintTally;
  const prevNumHintlessInStreak = wonYesterday
    ? currentState.stats.numHintlessInStreak
    : 0;
  const newNumHintlessInStreak = hintsUsedToday
    ? prevNumHintlessInStreak
    : prevNumHintlessInStreak + 1;

  // Tally the number of hints used in the streak
  const prevNumHintsInStreak = wonYesterday
    ? currentState.stats.numHintsInStreak
    : 0;
  const newNumHintsInStreak = prevNumHintsInStreak + hintsUsedToday;

  // Update the number of games won for this weekday
  const dayNumber = today.getDay() as DayNumber; // typecast since ts doesn't know that getDay only returns these numbers

  const numWeekdayWon = currentState.stats.days[dayNumber].won + 1;

  const numWeekdayWonWithoutHints = hintsUsedToday
    ? currentState.stats.days[dayNumber].noHints
    : currentState.stats.days[dayNumber].noHints + 1;

  const newDays = {
    ...currentState.stats.days,
    [dayNumber]: {won: numWeekdayWon, noHints: numWeekdayWonWithoutHints},
  };

  return {
    ...currentState.stats,
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
  currentState: GameStateDaily,
  payload: DailyReducerPayload,
): GameStateDaily {
  if (payload.action === "newGame") {
    return gameInit({
      useSaved: false,
      isDaily: true,
    });
  } else if (payload.action === "clearStreakIfNeeded") {
    const lastDateWon = currentState.stats.lastDateWon;
    const wonYesterday = lastDateWon && isYesterday(lastDateWon);
    const wonToday = lastDateWon && isToday(lastDateWon);

    if (wonYesterday || wonToday) {
      // if won in the past day, don't need to clear the streak
      return currentState;
    } else {
      // otherwise clear the streak but leave other stats intact
      const newStats = {
        ...currentState.stats,
        streak: 0,
        numHintlessInStreak: 0,
        numHintsInStreak: 0,
      };

      return {
        ...currentState,
        stats: newStats,
      };
    }
  } else {
    const updatedState = gameReducer(currentState, payload);

    if (updatedState.gameIsSolved && !currentState.gameIsSolved) {
      const newStats = getNewDailyStats(currentState);
      return {
        ...updatedState,
        ...(newStats && {stats: newStats}),
      };
    } else {
      return updatedState;
    }
  }
}
