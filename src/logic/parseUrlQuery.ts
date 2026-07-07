export function parseUrlQuery():
  | {isCustom: true; seed: string; numLetters: undefined}
  | {isCustom: false; seed: string; numLetters: number}
  | {isCustom: undefined; seed: undefined; numLetters: undefined} {
  const searchParams = new URLSearchParams(document.location.search);
  const query = searchParams.get("id");

  // The query differs depending on whether it represents a random puzzle or a custom puzzle:
  // For custom puzzles, it is "custom-" followed by a representative string
  // For random puzzles, it is the seed and the min number of letters, separated by an underscore
  if (query?.startsWith("custom-")) {
    return {
      isCustom: true,
      seed: query.substring("custom-".length),
      numLetters: undefined,
    };
  } else if (query) {
    const [seed, numLetters] = query.split("_");
    return {isCustom: false, seed, numLetters: parseInt(numLetters)};
  } else return {isCustom: undefined, seed: undefined, numLetters: undefined};
}
