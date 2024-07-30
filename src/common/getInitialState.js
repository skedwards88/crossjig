export function getInitialState(savedDisplay, hasVisited) {
  if (!hasVisited) {
    return "rules";
  }

  if (savedDisplay === "game" || savedDisplay === "daily") {
    return savedDisplay;
  }

  return "game";
}
