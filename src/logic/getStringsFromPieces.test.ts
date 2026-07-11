import type {PieceInGame, PieceWithoutLocation} from "../Types";
import {getStringsFromPieces} from "./getStringsFromPieces";

describe("getStringsFromPieces", () => {
  test("if `solution` is true, it returns the strings based on the solution", () => {
    const pieces: PieceWithoutLocation[] = [
      {
        letters: [["I"], ["B"], ["R"]],
        id: 2,
        solutionTop: 2,
        solutionLeft: 4,
      },
      {
        letters: [["L", "E", "T"]],
        id: 1,
        solutionTop: 1,
        solutionLeft: 5,
      },
      {
        letters: [
          ["M", "A", "L"],
          ["U", "", ""],
          ["S", "", ""],
        ],
        id: 0,
        solutionTop: 1,
        solutionLeft: 2,
      },
      {
        letters: [
          ["", "A", ""],
          ["C", "R", "Y"],
          ["", "Y", ""],
        ],
        id: 4,
        solutionTop: 5,
        solutionLeft: 3,
      },
      {
        letters: [["P", "T"]],
        id: 5,
        solutionTop: 6,
        solutionLeft: 6,
      },
      {
        letters: [["E"], ["D"]],
        id: 3,
        solutionTop: 4,
        solutionLeft: 2,
      },
    ];

    expect(
      getStringsFromPieces({pieces, gridSize: 10, solution: true}),
    ).toEqual(["MALLET", "CRYPT", "MUSED", "LIBRARY"]);
  });

  test("if `solution` is false, it returns the strings based on placement of the pieces in a grid", () => {
    const pieces: PieceInGame[] = [
      {
        letters: [["E"], ["D"]],
        id: 3,
        solutionTop: 4,
        solutionLeft: 2,
        boardLeft: 2,
        boardTop: 4,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        poolIndex: undefined,
      },
      {
        letters: [
          ["M", "A", "L"],
          ["U", "", ""],
          ["S", "", ""],
        ],
        id: 0,
        solutionTop: 1,
        solutionLeft: 2,
        boardLeft: 2,
        boardTop: 1,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        poolIndex: undefined,
      },
      {
        letters: [["L", "E", "T"]],
        id: 1,
        solutionTop: 1,
        solutionLeft: 5,
        boardLeft: 5,
        boardTop: 1,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        poolIndex: undefined,
      },
      {
        letters: [
          ["", "A", ""],
          ["C", "R", "Y"],
          ["", "Y", ""],
        ],
        id: 4,
        solutionTop: 5,
        solutionLeft: 3,
        boardLeft: 4,
        boardTop: 6,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        poolIndex: undefined,
      },
      {
        letters: [["P", "T"]],
        id: 5,
        solutionTop: 6,
        solutionLeft: 6,
        boardLeft: 7,
        boardTop: 7,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        poolIndex: undefined,
      },
      {
        letters: [["I"], ["B"], ["R"]],
        id: 2,
        solutionTop: 2,
        solutionLeft: 4,
        dragGroupTop: 0,
        dragGroupLeft: 0,
        boardLeft: undefined,
        boardTop: undefined,
        poolIndex: undefined,
      },
    ];

    expect(
      getStringsFromPieces({pieces, gridSize: 10, solution: false}),
    ).toEqual(["MALLET", "CRYPT", "MUSED", "ARY"]);
  });

  test("if `solution` is false, any pieces that are not on the board are excluded", () => {
    const pieces: PieceInGame[] = [
      {
        letters: [
          ["", "C", ""],
          ["L", "A", "Y"],
          ["", "R", ""],
        ],
        boardTop: 5,
        boardLeft: 7,
        id: 0,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [["K"], ["N"], ["O"]],
        boardTop: 2,
        boardLeft: 10,
        id: 1,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [["N", "S"]],
        boardTop: 10,
        boardLeft: 9,
        id: 2,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [["E", "A"]],
        boardTop: 10,
        boardLeft: 6,
        id: 3,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [["B"], ["S"]],
        boardTop: 5,
        boardLeft: 10,
        id: 4,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [
          ["I", "", ""],
          ["V", "", ""],
          ["E", "Z", "E"],
        ],
        id: 5,
        poolIndex: 5,
        boardTop: undefined,
        boardLeft: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionLeft: 0,
        solutionTop: 0,
      },
      {
        letters: [["A"], ["W"]],
        boardTop: 3,
        boardLeft: 5,
        id: 6,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [
          ["S", "P", "A"],
          ["", "R", ""],
          ["", "E", ""],
        ],
        boardTop: 0,
        boardLeft: 0,
        id: 7,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [
          ["", "", "E"],
          ["S", "O", "R"],
        ],
        boardTop: 10,
        boardLeft: 2,
        id: 8,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [
          ["", "F", ""],
          ["", "E", ""],
          ["B", "R", "E"],
        ],
        boardTop: 3,
        boardLeft: 0,
        id: 9,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [["V", "I"]],
        boardTop: 11,
        boardLeft: 0,
        id: 10,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [
          ["N", "S"],
          ["A", ""],
          ["T", "E"],
        ],
        boardTop: 0,
        boardLeft: 3,
        id: 11,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [
          ["", "N", ""],
          ["S", "I", "M"],
          ["", "C", ""],
        ],
        boardTop: 7,
        boardLeft: 3,
        id: 12,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [
          ["", "", "R"],
          ["", "", "A"],
          ["L", "L", "S"],
        ],
        boardTop: 0,
        boardLeft: 5,
        id: 13,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [["F"]],
        boardTop: 1,
        boardLeft: 5,
        id: 14,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [["P"], ["Y"]],
        boardTop: 3,
        boardLeft: 7,
        id: 15,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [["D", "E"]],
        boardTop: 6,
        boardLeft: 5,
        id: 16,
        poolIndex: undefined,
        dragGroupTop: undefined,
        dragGroupLeft: undefined,
        solutionTop: 0,
        solutionLeft: 0,
      },
      {
        letters: [
          ["P", "L", "E"],
          ["", "", "E"],
          ["", "", "R"],
        ],
        id: 17,
        poolIndex: undefined,
        boardTop: undefined,
        boardLeft: undefined,
        dragGroupTop: 1,
        dragGroupLeft: 1,
        solutionLeft: 0,
        solutionTop: 0,
      },
    ];

    expect(
      getStringsFromPieces({pieces, gridSize: 12, solution: false}),
    ).toEqual([
      "SPANS",
      "TELLS",
      "BRE",
      "DELAYS",
      "SIM",
      "EA",
      "NS",
      "VISOR",
      "PREFER",
      "NAT",
      "NICER",
      "FLAW",
      "RASPY",
      "CAR",
      "KNOBS",
    ]);
  });

  test("any overlapping positions are overwritten", () => {
    const pieces: PieceWithoutLocation[] = [
      {
        letters: [
          ["", "C", ""],
          ["L", "A", "Y"],
          ["", "R", ""],
        ],
        solutionTop: 0,
        solutionLeft: 0,
        id: 0,
      },
      {letters: [["", "T", "O"]], solutionTop: 0, solutionLeft: 0, id: 1},
    ];
    expect(getStringsFromPieces({pieces, gridSize: 3, solution: true})).toEqual(
      ["TO", "LAY", "TAR", "OY"],
    );
  });

  test("an empty array of pieces results in an empty list", () => {
    const pieces: PieceWithoutLocation[] = [];
    expect(getStringsFromPieces({pieces, gridSize: 3, solution: true})).toEqual(
      [],
    );
  });

  test("an error is thrown if a piece does not fit on the grid", () => {
    const pieces: PieceWithoutLocation[] = [
      {
        letters: [
          ["", "C", ""],
          ["L", "A", "Y"],
          ["", "R", ""],
        ],
        solutionTop: 0,
        solutionLeft: 0,
        id: 0,
      },
      {letters: [["", "T", "O"]], solutionTop: 0, solutionLeft: 0, id: 1},
    ];

    expect(() =>
      getStringsFromPieces({pieces, gridSize: 2, solution: true}),
    ).toThrow("A piece falls outside of the grid boundary.");
  });

  test("an error is thrown if either pieces or gridSize is undefined", () => {
    // @ts-expect-error intentionally testing invalid input
    expect(() => getStringsFromPieces({gridSize: 2})).toThrow(
      "Pieces must be defined.",
    );

    // @ts-expect-error intentionally testing invalid input
    expect(() => getStringsFromPieces({pieces: []})).toThrow(
      "Grid size must be defined.",
    );
  });
});

test("if `solution` is false, and no pieces are on the board, an empty grid is returned", () => {
  const pieces: PieceInGame[] = [
    {
      letters: [
        ["", "C", ""],
        ["L", "A", "Y"],
        ["", "R", ""],
      ],
      id: 0,
      poolIndex: 1,
      boardTop: undefined,
      boardLeft: undefined,
      dragGroupTop: undefined,
      dragGroupLeft: undefined,
      solutionLeft: 0,
      solutionTop: 0,
    },
    {
      letters: [["K"], ["N"], ["O"]],
      id: 1,
      poolIndex: 1,
      boardTop: undefined,
      boardLeft: undefined,
      dragGroupTop: undefined,
      dragGroupLeft: undefined,
      solutionLeft: 0,
      solutionTop: 0,
    },
    {
      letters: [["N", "S"]],
      id: 2,
      poolIndex: undefined,
      boardTop: undefined,
      boardLeft: undefined,
      dragGroupTop: 1,
      dragGroupLeft: 1,
      solutionLeft: 0,
      solutionTop: 0,
    },
    {
      letters: [["E", "A"]],
      id: 3,
      poolIndex: undefined,
      boardTop: undefined,
      boardLeft: undefined,
      dragGroupTop: 1,
      dragGroupLeft: 1,
      solutionLeft: 0,
      solutionTop: 0,
    },
    {
      letters: [["B"], ["S"]],
      id: 4,
      poolIndex: 1,
      boardTop: undefined,
      boardLeft: undefined,
      dragGroupTop: undefined,
      dragGroupLeft: undefined,
      solutionLeft: 0,
      solutionTop: 0,
    },
  ];

  expect(getStringsFromPieces({pieces, gridSize: 12, solution: false})).toEqual(
    [],
  );
});
