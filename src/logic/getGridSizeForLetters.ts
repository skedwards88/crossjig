export function getGridSizeForLetters(numLetters: number): number {
  if (numLetters > 50) {
    return 12;
  } else if (numLetters > 30) {
    return 10;
  } else return 8;
}
