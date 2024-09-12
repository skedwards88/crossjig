import {arrayToGrid} from "./arrayToGrid";

describe("arrayToGrid", () => {
  test("converts a 1D array to a 2D array", () => {
    const input = [1, "2", 3, 4, 5, "Z", 7, 8, 9];
    const output = arrayToGrid(input);
    expect(output).toEqual([
      [1, "2", 3],
      [4, 5, "Z"],
      [7, 8, 9],
    ]);
  });

  test("works on arrays of length 1", () => {
    const input = [10];
    const output = arrayToGrid(input);
    expect(output).toEqual([[10]]);
  });

  test("empty arrays are returned as empty arrays", () => {
    const input = [];
    const output = arrayToGrid(input);
    expect(output).toEqual([]);
  });

  test("errors if array doesn't form a square", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    expect(() => arrayToGrid(input)).toThrow(
      "Array length cannot form a square grid",
    );
  });
});
