export function getInitialState(savedDisplay, hasVisitedEver, hasSeenWhatsNew) {
  if (!hasVisitedEver) {
    return "rules";
  }

  if (!hasSeenWhatsNew) {
    return "whatsNew";
  }

  if (savedDisplay === "game" || savedDisplay === "daily") {
    return savedDisplay;
  }

  return "game";
}
