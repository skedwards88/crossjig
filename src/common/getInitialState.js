export function getInitialState(savedDisplay, hasVisited) {
  // todo revert
  return "custom";
  if (!hasVisited) {
    return "rules";
  }

  if (savedDisplay === "game" || savedDisplay === "daily") {
    return savedDisplay;
  }

  return "game";
}
