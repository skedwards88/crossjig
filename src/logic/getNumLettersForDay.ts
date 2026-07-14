import type {DayNumber} from "../Types";

export function getNumLettersForDay(dayNumber?: DayNumber | undefined): number {
  if (dayNumber === undefined) {
    dayNumber = new Date().getDay() as DayNumber; // typecast since ts doesn't know that getDay only returns these numbers
  }

  const wordLengths = [
    60, // Sunday
    20,
    25,
    30,
    35,
    40,
    50,
  ];

  return wordLengths[dayNumber];
}
