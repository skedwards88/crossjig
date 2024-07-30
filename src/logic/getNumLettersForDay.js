export function getNumLettersForDay() {
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
