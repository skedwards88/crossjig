export function getInitialState(
  savedDisplay,
  hasVisitedEver,
  hasVisitedRecently,
) {
  if (!hasVisitedEver) {
    return "rules";
  }

  if (!hasVisitedRecently) {
    return "whatsNew";
  }

  if (savedDisplay === "game" || savedDisplay === "daily") {
    return savedDisplay;
  }

  return "game";
}
