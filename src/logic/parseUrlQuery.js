export function parseUrlQuery() {
  const searchParams = new URLSearchParams(document.location.search);
  const query = searchParams.get("id");

  let isCustom;
  let numLetters;
  let seed;

  // The query differs depending on whether it represents a random puzzle or a custom puzzle:
  // For custom puzzles, it is "custom-" followed by a representative string
  // For random puzzles, it is the seed and the min number of letters, separated by an underscore
  if (query && query.startsWith("custom-")) {
    seed = query.substring("custom-".length);
    isCustom = true;
  } else if (query) {
    [seed, numLetters] = query.split("_");
    numLetters = parseInt(numLetters);
    isCustom = false;
  }

  return [isCustom, seed, numLetters];
}
