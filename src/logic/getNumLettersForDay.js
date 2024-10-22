export function getNumLettersForDay(dayNumber) {
  if (dayNumber === undefined) {
    dayNumber = new Date().getDay();
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
