import { getGridFromPieces } from "./getGridFromPieces";

describe("getGridFromPieces", () => {
  test("if `solution` is true, it returns a 2D array representing the placement of the pieces in a grid based on the solution", () => {
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
    expect(getGridFromPieces({ pieces, gridSize: 12, solution: true })).toEqual(
      expectedGrid
    );
  });

  test("if `solution` is false, it returns a 2D array representing the placement of the pieces in a grid", () => {
    const pieces = [
      {
        letters: [
          ["", "C", ""],
          ["L", "A", "Y"],
          ["", "R", ""],
        ],
        boardTop: 5,
        boardLeft: 7,
      },
      {
        letters: [["K"], ["N"], ["O"]],
        boardTop: 2,
        boardLeft: 10,
      },
      { letters: [["N", "S"]], boardTop: 10, boardLeft: 9 },
      { letters: [["E", "A"]], boardTop: 10, boardLeft: 6 },
      { letters: [["B"], ["S"]], boardTop: 5, boardLeft: 10 },
      {
        letters: [
          ["I", "", ""],
          ["V", "", ""],
          ["E", "Z", "E"],
        ],
        boardTop: 3,
        boardLeft: 3,
      },
      { letters: [["A"], ["W"]], boardTop: 3, boardLeft: 5 },
      {
        letters: [
          ["S", "P", "A"],
          ["", "R", ""],
          ["", "E", ""],
        ],
        boardTop: 0,
        boardLeft: 0,
      },
      {
        letters: [
          ["", "", "E"],
          ["S", "O", "R"],
        ],
        boardTop: 10,
        boardLeft: 2,
      },
      {
        letters: [
          ["", "F", ""],
          ["", "E", ""],
          ["B", "R", "E"],
        ],
        boardTop: 3,
        boardLeft: 0,
      },
      { letters: [["V", "I"]], boardTop: 11, boardLeft: 0 },
      {
        letters: [
          ["N", "S"],
          ["A", ""],
          ["T", "E"],
        ],
        boardTop: 0,
        boardLeft: 3,
      },
      {
        letters: [
          ["", "N", ""],
          ["S", "I", "M"],
          ["", "C", ""],
        ],
        boardTop: 7,
        boardLeft: 3,
      },
      {
        letters: [
          ["", "", "R"],
          ["", "", "A"],
          ["L", "L", "S"],
        ],
        boardTop: 0,
        boardLeft: 5,
      },
      { letters: [["F"]], boardTop: 1, boardLeft: 5 },
      { letters: [["P"], ["Y"]], boardTop: 3, boardLeft: 7 },
      { letters: [["D", "E"]], boardTop: 6, boardLeft: 5 },
      {
        letters: [
          ["P", "L", "E"],
          ["", "", "E"],
          ["", "", "R"],
        ],
        boardTop: 8,
        boardLeft: 6,
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
    expect(
      getGridFromPieces({ pieces, gridSize: 12, solution: false })
    ).toEqual(expectedGrid);
  });

  test("if `solution` is false, any pieces that are not on the board are excluded", () => {
    const pieces = [
      {
        letters: [
          ["", "C", ""],
          ["L", "A", "Y"],
          ["", "R", ""],
        ],
        boardTop: 5,
        boardLeft: 7,
      },
      {
        letters: [["K"], ["N"], ["O"]],
        boardTop: 2,
        boardLeft: 10,
      },
      { letters: [["N", "S"]], boardTop: 10, boardLeft: 9 },
      { letters: [["E", "A"]], boardTop: 10, boardLeft: 6 },
      { letters: [["B"], ["S"]], boardTop: 5, boardLeft: 10 },
      {
        letters: [
          ["I", "", ""],
          ["V", "", ""],
          ["E", "Z", "E"],
        ],
        boardTop: undefined,
        boardLeft: undefined,
      },
      { letters: [["A"], ["W"]], boardTop: 3, boardLeft: 5 },
      {
        letters: [
          ["S", "P", "A"],
          ["", "R", ""],
          ["", "E", ""],
        ],
        boardTop: 0,
        boardLeft: 0,
      },
      {
        letters: [
          ["", "", "E"],
          ["S", "O", "R"],
        ],
        boardTop: 10,
        boardLeft: 2,
      },
      {
        letters: [
          ["", "F", ""],
          ["", "E", ""],
          ["B", "R", "E"],
        ],
        boardTop: 3,
        boardLeft: 0,
      },
      { letters: [["V", "I"]], boardTop: 11, boardLeft: 0 },
      {
        letters: [
          ["N", "S"],
          ["A", ""],
          ["T", "E"],
        ],
        boardTop: 0,
        boardLeft: 3,
      },
      {
        letters: [
          ["", "N", ""],
          ["S", "I", "M"],
          ["", "C", ""],
        ],
        boardTop: 7,
        boardLeft: 3,
      },
      {
        letters: [
          ["", "", "R"],
          ["", "", "A"],
          ["L", "L", "S"],
        ],
        boardTop: 0,
        boardLeft: 5,
      },
      { letters: [["F"]], boardTop: 1, boardLeft: 5 },
      { letters: [["P"], ["Y"]], boardTop: 3, boardLeft: 7 },
      { letters: [["D", "E"]], boardTop: 6, boardLeft: 5 },
      {
        letters: [
          ["P", "L", "E"],
          ["", "", "E"],
          ["", "", "R"],
        ],
        boardTop: undefined,
        boardLeft: undefined,
      },
    ];

    const expectedGrid = [
      ["S", "P", "A", "N", "S", "", "", "R", "", "", "", ""],
      ["", "R", "", "A", "", "F", "", "A", "", "", "", ""],
      ["", "E", "", "T", "E", "L", "L", "S", "", "", "K", ""],
      ["", "F", "", "", "", "A", "", "P", "", "", "N", ""],
      ["", "E", "", "", "", "W", "", "Y", "", "", "O", ""],
      ["B", "R", "E", "", "", "", "", "", "C", "", "B", ""],
      ["", "", "", "", "", "D", "E", "L", "A", "Y", "S", ""],
      ["", "", "", "", "N", "", "", "", "R", "", "", ""],
      ["", "", "", "S", "I", "M", "", "", "", "", "", ""],
      ["", "", "", "", "C", "", "", "", "", "", "", ""],
      ["", "", "", "", "E", "", "E", "A", "", "N", "S", ""],
      ["V", "I", "S", "O", "R", "", "", "", "", "", "", ""],
    ];
    expect(
      getGridFromPieces({ pieces, gridSize: 12, solution: false })
    ).toEqual(expectedGrid);
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
    expect(getGridFromPieces({ pieces, gridSize: 3, solution: true })).toEqual(
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
    expect(getGridFromPieces({ pieces, gridSize: 3, solution: true })).toEqual(
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

    expect(() =>
      getGridFromPieces({ pieces, gridSize: 2, solution: true })
    ).toThrow("A piece falls outside of the grid boundary.");
  });

  test("an error is thrown if either pieces or gridSize is undefined", () => {
    expect(() => getGridFromPieces({ gridSize: 2 })).toThrow(
      "Pieces must be defined."
    );

    expect(() => getGridFromPieces({ pieces: [] })).toThrow(
      "Grid size must be defined."
    );
  });
});

test("if `solution` is false, and no pieces are on the board, an empty grid is returned", () => {
  const pieces = [
    {
      letters: [
        ["", "C", ""],
        ["L", "A", "Y"],
        ["", "R", ""],
      ],
      boardTop: undefined,
      boardLeft: undefined,
    },
    {
      letters: [["K"], ["N"], ["O"]],
      boardTop: undefined,
      boardLeft: undefined,
    },
    { letters: [["N", "S"]], boardTop: undefined, boardLeft: undefined },
    { letters: [["E", "A"]], boardTop: undefined, boardLeft: undefined },
    { letters: [["B"], ["S"]], boardTop: undefined, boardLeft: undefined },
  ];

  const expectedGrid = [
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
  expect(getGridFromPieces({ pieces, gridSize: 12, solution: false })).toEqual(
    expectedGrid
  );
});
