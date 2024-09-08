import {getInitialState} from "./getInitialState";

describe("getInitialState", () => {
  test("returns 'rules' if hasVisitedEver is false", () => {
    expect(getInitialState("game", false, true)).toBe("rules");

    expect(getInitialState("game", false, false)).toBe("rules");
  });

  test("returns 'whatsNew' if hasVisitedRecently is false", () => {
    expect(getInitialState("game", true, false)).toBe("whatsNew");
  });

  test("returns 'game' if hasVisitedEver and hasVisitedRecently are true and savedDisplay is 'game", () => {
    expect(getInitialState("game", true, true)).toBe("game");
  });

  test("returns 'daily' if hasVisitedEver and hasVisitedRecently are true and savedDisplay is 'daily", () => {
    expect(getInitialState("daily", true, true)).toBe("daily");
  });

  test("returns 'game' if hasVisitedEver and hasVisitedRecently are and savedDisplay is not 'game' or 'daily", () => {
    expect(getInitialState("rules", true, true)).toBe("game");
  });
});
