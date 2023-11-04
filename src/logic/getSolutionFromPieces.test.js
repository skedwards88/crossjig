import { getSolutionFromPieces } from "./getSolutionFromPieces";

describe("getSolutionFromPieces", () => {
  test("it returns a 2D array representing the placement of the pieces in a grid", () => {
    const pieces = [
      {
        letters: [
          ["", "C", ""],
          ["L", "A", "Y"],
          ["", "R", ""],
        ],
        solutionTop: 5,
        solutionLeft: 7,
      },
      {
        letters: [["K"], ["N"], ["O"]],
        solutionTop: 2,
        solutionLeft: 10,
      },
      { letters: [["N", "S"]], solutionTop: 10, solutionLeft: 9 },
      { letters: [["E", "A"]], solutionTop: 10, solutionLeft: 6 },
      { letters: [["B"], ["S"]], solutionTop: 5, solutionLeft: 10 },
      {
        letters: [
          ["I", "", ""],
          ["V", "", ""],
          ["E", "Z", "E"],
        ],
        solutionTop: 3,
        solutionLeft: 3,
      },
      { letters: [["A"], ["W"]], solutionTop: 3, solutionLeft: 5 },
      {
        letters: [
          ["S", "P", "A"],
          ["", "R", ""],
          ["", "E", ""],
        ],
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [
          ["", "", "E"],
          ["S", "O", "R"],
        ],
        solutionTop: 10,
        solutionLeft: 2,
      },
      {
        letters: [
          ["", "F", ""],
          ["", "E", ""],
          ["B", "R", "E"],
        ],
        solutionTop: 3,
        solutionLeft: 0,
      },
      { letters: [["V", "I"]], solutionTop: 11, solutionLeft: 0 },
      {
        letters: [
          ["N", "S"],
          ["A", ""],
          ["T", "E"],
        ],
        solutionTop: 0,
        solutionLeft: 3,
      },
      {
        letters: [
          ["", "N", ""],
          ["S", "I", "M"],
          ["", "C", ""],
        ],
        solutionTop: 7,
        solutionLeft: 3,
      },
      {
        letters: [
          ["", "", "R"],
          ["", "", "A"],
          ["L", "L", "S"],
        ],
        solutionTop: 0,
        solutionLeft: 5,
      },
      { letters: [["F"]], solutionTop: 1, solutionLeft: 5 },
      { letters: [["P"], ["Y"]], solutionTop: 3, solutionLeft: 7 },
      { letters: [["D", "E"]], solutionTop: 6, solutionLeft: 5 },
      {
        letters: [
          ["P", "L", "E"],
          ["", "", "E"],
          ["", "", "R"],
        ],
        solutionTop: 8,
        solutionLeft: 6,
      },
    ];

    const expectedGrid = [
      ["S", "P", "A", "N", "S", "", "", "R", "", "", "", ""],
      ["", "R", "", "A", "", "F", "", "A", "", "", "", ""],
      ["", "E", "", "T", "E", "L", "L", "S", "", "", "K", ""],
      ["", "F", "", "I", "", "A", "", "P", "", "", "N", ""],
      ["", "E", "", "V", "", "W", "", "Y", "", "", "O", ""],
      ["B", "R", "E", "E", "Z", "E", "", "", "C", "", "B", ""],
      ["", "", "", "", "", "D", "E", "L", "A", "Y", "S", ""],
      ["", "", "", "", "N", "", "", "", "R", "", "", ""],
      ["", "", "", "S", "I", "M", "P", "L", "E", "", "", ""],
      ["", "", "", "", "C", "", "", "", "E", "", "", ""],
      ["", "", "", "", "E", "", "E", "A", "R", "N", "S", ""],
      ["V", "I", "S", "O", "R", "", "", "", "", "", "", ""],
    ];
    expect(getSolutionFromPieces({ pieces, gridSize: 12 })).toEqual(
      expectedGrid
    );
  });

  test("any overlapping positions are overwritten", () => {
    const pieces = [
      {
        letters: [
          ["", "C", ""],
          ["L", "A", "Y"],
          ["", "R", ""],
        ],
        solutionTop: 0,
        solutionLeft: 0,
      },
      { letters: [["", "T", "O"]], solutionTop: 0, solutionLeft: 0 },
    ];
    const expectedGrid = [
      ["", "T", "O"],
      ["L", "A", "Y"],
      ["", "R", ""],
    ];
    expect(getSolutionFromPieces({ pieces, gridSize: 3 })).toEqual(
      expectedGrid
    );
  });

  test("an empty array of pieces results in an empty grid", () => {
    const pieces = [];
    const expectedGrid = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    expect(getSolutionFromPieces({ pieces, gridSize: 3 })).toEqual(
      expectedGrid
    );
  });

  test("an error is thrown if a piece does not fit on the grid", () => {
    const pieces = [
      {
        letters: [
          ["", "C", ""],
          ["L", "A", "Y"],
          ["", "R", ""],
        ],
        solutionTop: 0,
        solutionLeft: 0,
      },
      { letters: [["", "T", "O"]], solutionTop: 0, solutionLeft: 0 },
    ];

    expect(() => getSolutionFromPieces({ pieces, gridSize: 2 })).toThrow(
      "A piece falls outside of the grid boundary."
    );
  });

  test("an error is thrown if either input is undefined", () => {
    expect(() => getSolutionFromPieces({ gridSize: 2 })).toThrow(
      "Pieces must be defined."
    );

    expect(() => getSolutionFromPieces({ pieces: [] })).toThrow(
      "Grid size must be defined."
    );
  });
});
