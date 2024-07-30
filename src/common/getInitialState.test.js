import {getInitialState} from "./getInitialState";

describe("getInitialState", () => {
  test("returns 'rules' if hasVisited is false", () => {
    expect(getInitialState("game", false)).toBe("rules");
  });

  test("returns 'game' if hasVisited is true and savedDisplay is 'game", () => {
    expect(getInitialState("game", true)).toBe("game");
  });

  test("returns 'daily' if hasVisited is true and savedDisplay is 'daily", () => {
    expect(getInitialState("daily", true)).toBe("daily");
  });

  test("returns 'game' if hasVisited is true and savedDisplay is not 'game' or 'daily", () => {
    expect(getInitialState("rules", true)).toBe("game");
  });
});
