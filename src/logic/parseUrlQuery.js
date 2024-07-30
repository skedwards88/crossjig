export function parseUrlQuery() {
  const searchParams = new URLSearchParams(document.location.search);
  const seedQuery = searchParams.get("puzzle");

  // The seed query consists of two parts: the seed and the min number of letters, separated by an underscore
  let numLetters;
  let seed;
  if (seedQuery) {
    [seed, numLetters] = seedQuery.split("_");
    numLetters = parseInt(numLetters);
  }

  return [seed, numLetters];
}
