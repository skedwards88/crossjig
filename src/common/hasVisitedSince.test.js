import "jest-localstorage-mock";
import {hasVisitedSince} from "./hasVisitedSince";

describe("hasVisitedSince", () => {
  const stateName = "testLastVisited";

  test("returns false if lastVisited is not set", () => {
    localStorage.removeItem(stateName);
    expect(hasVisitedSince(stateName, "20240429")).toBe(false);
  });

  test("returns false if lastVisited is set to a date before the reset date", () => {
    localStorage.setItem(stateName, JSON.stringify("20240428"));
    expect(hasVisitedSince(stateName, "20240429")).toBe(false);
  });

  test("returns true if lastVisited is set to the reset date", () => {
    localStorage.setItem(stateName, JSON.stringify("20240429"));
    expect(hasVisitedSince(stateName, "20240429")).toBe(true);
  });

  test("returns true if lastVisited is set to a date after the reset date", () => {
    localStorage.setItem(stateName, JSON.stringify("20240430"));
    expect(hasVisitedSince(stateName, "20240429")).toBe(true);
  });
});
