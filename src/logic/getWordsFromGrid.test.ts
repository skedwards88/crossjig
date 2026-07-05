import type {LetterOrEmpty} from "../Types";
import {getWordsFromGrid} from "./getWordsFromGrid";

describe("getWordsFromGrid", () => {
  test("it returns the horizontal and vertical sequences of 2 or more characters from a 2D array of characters", () => {
    const grid: LetterOrEmpty[][] = [
      ["A", "B", "", "", ""],
      ["E", "", "", "F", "I"],
      ["G", "H", "I", "M", ""],
      ["J", "K", "", "Q", "W"],
      ["W", "X", "", "", ""],
    ];
    const expectedWords = [
      "AB",
      "FI",
      "GHIM",
      "JK",
      "QW",
      "WX",
      "AEGJW",
      "HKX",
      "FMQ",
    ];
    expect(getWordsFromGrid(grid)).toEqual(expectedWords);
  });

  test("it returns an empty array when there are no characters", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    expect(getWordsFromGrid(grid)).toEqual([]);
  });

  test("it returns an empty array when there are no sequences longer than 1 character", () => {
    const grid: LetterOrEmpty[][] = [
      ["A", "", "C"],
      ["", "B", ""],
      ["D", "", ""],
    ];
    expect(getWordsFromGrid(grid)).toEqual([]);
  });

  test("it works with characters at the borders of the grid", () => {
    const grid: LetterOrEmpty[][] = [
      ["O", "N", "E"],
      ["U", "", "X"],
      ["T", "W", "O"],
    ];
    const expectedWords = ["ONE", "TWO", "OUT", "EXO"];
    expect(getWordsFromGrid(grid)).toEqual(expectedWords);
  });

  test("it rejects grids have uneven row lengths", () => {
    const grid: LetterOrEmpty[][] = [
      ["A", "", "C"],
      ["", "B", "", "E"],
      ["D", "", ""],
    ];
    expect(() => getWordsFromGrid(grid)).toThrow(
      "All of the rows in the grid must have the same length.",
    );
  });
});
