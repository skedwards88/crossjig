import {resizeGrid} from "./resizeGrid";

describe("resizeGrid", () => {
  test("trims a grid down to 8x8", () => {
    const input = [
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "A", "B", "C", "", "", "", "", ""],
      ["", "", "", "", "A", "B", "C", "", "", "", "", ""],
      ["", "", "", "", "X", "Y", "Z", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
    ];
    const expected = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "X", "Y", "Z", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("expands a grid up to 8x8", () => {
    const input = [
      ["A", "B", "C", "", "", ""],
      ["A", "B", "C", "", "", ""],
      ["X", "Y", "Z", "", "", ""],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
    ];
    const expected = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "X", "Y", "Z", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("pads a grid so that there 1 empty row/col on each edge", () => {
    const input = [
      ["A", "", "", "", "", "", "", "", "", "", "", "B"],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["C", "", "", "", "", "", "", "", "", "", "", "D"],
    ];
    const expected = [
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "A", "", "", "", "", "", "", "", "", "", "", "B", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "C", "", "", "", "", "", "", "", "", "", "", "D", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("centers content", () => {
    const input = [
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "A", "B", "C", "", "", "", "", "", "", "", ""],
      ["", "A", "B", "C", "", "", "", "", "", "", "", ""],
      ["", "X", "Y", "Z", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    const expected = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "X", "Y", "Z", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("works if the grid contents are on the left edge and need padding", () => {
    const input = [
      ["A", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["D", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["C", "", "", "", "", "", "", "", "", "", "", ""],
    ];
    const expected = [
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "A", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "D", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "C", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("works if the grid contents are on the right edge and need padding", () => {
    const input = [
      ["", "", "", "", "", "", "", "", "", "", "", "A"],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "D"],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "C"],
    ];
    const expected = [
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "A", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "D", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "C", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("works if the grid contents are on the top edge and need padding", () => {
    const input = [
      ["A", "", "", "D", "", "", "", "", "", "", "", "C"],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
    ];
    const expected = [
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "A", "", "", "D", "", "", "", "", "", "", "", "C", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("works if the grid contents are on the bottom edge and need padding", () => {
    const input = [
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["A", "", "", "D", "", "", "", "", "", "", "", "C"],
    ];
    const expected = [
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "A", "", "", "D", "", "", "", "", "", "", "", "C", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("works if the grid contents are near bottom edge and need trimming on the top and padding on the bottom", () => {
    const input = [
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "A", "B", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    const expected = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "A", "B", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("works if the grid contents are near top edge and need trimming on the bottom and padding on the top", () => {
    const input = [
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "A", "B", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    const expected = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "A", "B", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("works if the grid contents are near left edge", () => {
    const input = [
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "A", "B", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    const expected = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "A", "B", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("works if the grid contents are near right edge", () => {
    const input = [
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "A", "B", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
    ];

    const expected = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "A", "B", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("testing odd number row/cols", () => {
    const input = [
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "A", "B", "C", "", "", "", "", ""],
      ["", "", "", "A", "B", "C", "", "", "", "", ""],
      ["", "", "", "X", "Y", "Z", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", ""],
    ];
    const expected = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "X", "Y", "Z", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("works on an empty grid", () => {
    const input = [
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
    ];

    const expected = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(expected);
  });

  test("if the grid does not need adjustment, returns a copy of the grid", () => {
    const input = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "X", "Y", "Z", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(resizeGrid(input)).toEqual(input);
    expect(resizeGrid(input)).not.toBe(input);
  });

  test("errors if grid is taller than wide", () => {
    const input = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "X", "Y", "Z", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(() => resizeGrid(input)).toThrow("Input grid is not square");
  });

  test("errors if grid is wider than tall", () => {
    const input = [
      ["", "", "", "", "", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "A", "B", "C", "", "", ""],
      ["", "", "X", "Y", "Z", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ];

    expect(() => resizeGrid(input)).toThrow("Input grid is not square");
  });
});
