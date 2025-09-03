export function getInitialState(
  savedDisplay,
  hasVisitedEver,
  hasSeenWhatsNew,
  isCustom,
) {
  if (!hasVisitedEver) {
    return "rules";
  }

  if (!hasSeenWhatsNew) {
    return "whatsNew";
  }

  if (isCustom) {
    return "game";
  }

  if (savedDisplay === "game" || savedDisplay === "daily") {
    return savedDisplay;
  }

  return "game";
}
