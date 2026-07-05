import type {DisplayState} from "../Types";

export function getInitialState(
  savedDisplay: DisplayState,
  hasVisitedEver: boolean,
  hasSeenWhatsNew: boolean,
  isCustom: boolean,
): DisplayState {
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
