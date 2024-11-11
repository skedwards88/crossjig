import {getInitialState} from "./getInitialState";

describe("getInitialState", () => {
  test("returns 'rules' if hasVisitedEver is false", () => {
    expect(getInitialState("game", false, true, true)).toBe("rules");

    expect(getInitialState("game", false, false, true)).toBe("rules");
  });

  test("returns 'whatsNew' if hasSeenWhatsNew is false", () => {
    expect(getInitialState("game", true, false, true)).toBe("whatsNew");
  });

  test("returns 'game' if hasVisitedEver and hasSeenWhatsNew are true and savedDisplay is 'game", () => {
    expect(getInitialState("game", true, true, false)).toBe("game");
  });

  test("returns 'daily' if hasVisitedEver and hasSeenWhatsNew are true and savedDisplay is 'daily", () => {
    expect(getInitialState("daily", true, true, false)).toBe("daily");
  });

  test("returns 'game' if hasVisitedEver and hasSeenWhatsNew are true and savedDisplay is 'daily but isCustom is true", () => {
    expect(getInitialState("daily", true, true, true)).toBe("game");
  });

  test("returns 'game' if hasVisitedEver and hasSeenWhatsNew are true and savedDisplay is not 'game' or 'daily", () => {
    expect(getInitialState("rules", true, true, false)).toBe("game");
  });
});
