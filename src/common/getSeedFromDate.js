export function getSeedFromDate() {
  // Get a seed based on today's date 'YYYYMMDD'
  const currentDate = new Date();
  const seed = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}`.toString();

  return seed;
}
