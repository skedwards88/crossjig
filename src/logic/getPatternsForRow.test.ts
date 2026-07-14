import type {LetterOrEmpty} from "../Types";
import getPatternsForRow from "./getPatternsForRow";

describe("getPatternsForRow", () => {
  test("min length is respected", () => {
    const grid: LetterOrEmpty[][] = [["", "A", "B", "C", "", "D", "E"]];

    const index = 0;

    expect(getPatternsForRow(grid, index, 3)).toEqual([
      ["[A-Za-z]ABC", 0],
      ["[A-Za-z]ABC[A-Za-z]DE", 0],
      ["ABC[A-Za-z]DE", 1],
    ]);

    expect(getPatternsForRow(grid, index, 4)).toEqual([
      ["[A-Za-z]ABC", 0],
      ["[A-Za-z]ABC[A-Za-z]DE", 0],
      ["ABC[A-Za-z]DE", 1],
    ]);

    expect(getPatternsForRow(grid, index, 5)).toEqual([
      ["[A-Za-z]ABC[A-Za-z]DE", 0],
      ["ABC[A-Za-z]DE", 1],
    ]);

    expect(getPatternsForRow(grid, index, 6)).toEqual([
      ["[A-Za-z]ABC[A-Za-z]DE", 0],
      ["ABC[A-Za-z]DE", 1],
    ]);

    expect(getPatternsForRow(grid, index, 7)).toEqual([
      ["[A-Za-z]ABC[A-Za-z]DE", 0],
    ]);

    expect(getPatternsForRow(grid, index, 8)).toEqual([]);
  });

  test("empty row gives no patterns", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
    ];

    const index = 1;

    const minLength = 3;

    expect(getPatternsForRow(grid, index, minLength)).toEqual([]);
  });

  test("full row yields no patterns", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "", "", "", "", "", ""],
      ["F", "G", "H", "I", "J", "K", "L"],
      ["", "", "", "", "", "", ""],
    ];

    const index = 1;

    const minLength = 3;

    expect(getPatternsForRow(grid, index, minLength)).toEqual([]);
  });

  test("a row with on empty space and no neighbors above or below yields one pattern", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "", "", "", "", "", ""],
      ["F", "G", "H", "", "J", "K", "L"],
      ["", "", "", "", "", "", ""],
    ];

    const index = 1;

    const minLength = 3;

    expect(getPatternsForRow(grid, index, minLength)).toEqual([
      ["FGH[A-Za-z]JKL", 0],
    ]);
  });

  test("a letter above an empty space in the row excludes patterns that include that space", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "", "", "", "X", "", ""],
      ["", "A", "B", "C", "", "D", "E"],
      ["", "", "", "", "", "", ""],
    ];

    const index = 1;

    const minLength = 3;

    const output = getPatternsForRow(grid, index, minLength);

    expect(output).not.toContainEqual(["[A-Za-z]ABC[A-Za-z]DE", 0]);

    expect(output).not.toContainEqual(["ABC[A-Za-z]DE", 1]);
  });

  test("a letter above an empty space in the row excludes patterns that include that space, even at the bottom row", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "", "", "", "X", "", ""],
      ["", "A", "B", "C", "", "D", "E"],
    ];

    const index = 1;

    const minLength = 3;

    const output = getPatternsForRow(grid, index, minLength);

    expect(output).not.toContainEqual(["[A-Za-z]ABC[A-Za-z]DE", 0]);

    expect(output).not.toContainEqual(["ABC[A-Za-z]DE", 1]);
  });

  test("a letter above an empty space in the row excludes patterns that include that space but does not prevent later patterns from starting", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "", "", "", "X", "", "", ""],
      ["", "A", "B", "C", "", "", "D", "E"],
      ["", "", "", "", "", "", "", ""],
    ];

    const index = 1;

    const minLength = 3;

    expect(getPatternsForRow(grid, index, minLength)).toEqual([
      ["[A-Za-z]ABC", 0],
      ["[A-Za-z]DE", 5],
    ]);
  });

  test("a letter below an empty space in the row excludes patterns that include that space", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "", "", "", "", "", ""],
      ["", "A", "B", "C", "", "D", "E"],
      ["", "", "", "", "X", "", ""],
    ];

    const index = 1;

    const minLength = 3;

    const output = getPatternsForRow(grid, index, minLength);

    expect(output).not.toContainEqual(["[A-Za-z]ABC[A-Za-z]DE", 0]);

    expect(output).not.toContainEqual(["ABC[A-Za-z]DE", 1]);
  });

  test("a letter below an empty space in the row excludes patterns that include that space, even at the top row", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "A", "B", "C", "", "D", "E"],
      ["", "", "", "", "X", "", ""],
    ];

    const index = 0;

    const minLength = 3;

    const output = getPatternsForRow(grid, index, minLength);

    expect(output).not.toContainEqual(["[A-Za-z]ABC[A-Za-z]DE", 0]);

    expect(output).not.toContainEqual(["ABC[A-Za-z]DE", 1]);
  });

  test("a letter above a letter in the row does not exclude patterns that include that space", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "X", "X", "X", "", "X", "X"],
      ["", "A", "B", "C", "", "D", "E"],
      ["", "", "", "", "", "", ""],
    ];

    const index = 1;

    const minLength = 3;

    expect(getPatternsForRow(grid, index, minLength)).toEqual([
      ["[A-Za-z]ABC", 0],
      ["[A-Za-z]ABC[A-Za-z]DE", 0],
      ["ABC[A-Za-z]DE", 1],
    ]);
  });

  test("a letter below a letter in the row does not exclude patterns that include that space", () => {
    const grid: LetterOrEmpty[][] = [
      ["", "", "", "", "", "", ""],
      ["", "A", "B", "C", "", "D", "E"],
      ["", "", "X", "", "", "", ""],
    ];

    const index = 1;

    const minLength = 3;

    expect(getPatternsForRow(grid, index, minLength)).toEqual([
      ["[A-Za-z]ABC", 0],
      ["[A-Za-z]ABC[A-Za-z]DE", 0],
      ["ABC[A-Za-z]DE", 1],
    ]);
  });

  test("excludes patterns that start immediately after a letter", () => {
    const grid: LetterOrEmpty[][] = [["A", "", "", "B", "", ""]];

    const index = 0;

    const minLength = 3;

    const output = getPatternsForRow(grid, index, minLength);
    expect(output).not.toContainEqual(["[A-Za-z][A-Za-z]B", 0]);
    expect(output).not.toContainEqual(["[A-Za-z][A-Za-z]B[A-Za-z]", 0]);
    expect(output).not.toContainEqual(["[A-Za-z][A-Za-z]B[A-Za-z][A-Za-z]", 0]);
  });

  test("no patterns are found when minLength exceeds row length", () => {
    const grid: LetterOrEmpty[][] = [["", "A", "B", "C"]];

    const index = 0;

    expect(getPatternsForRow(grid, index, 5)).toEqual([]);
  });
});
