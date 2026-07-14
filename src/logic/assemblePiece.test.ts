import {assemblePiece} from "./assemblePiece";

describe("assemblePiece", () => {
  test("vertical 1x3", () => {
    expect(
      assemblePiece({
        pieceData: [
          {letter: "E", top: 0, left: 0},
          {letter: "T", top: 1, left: 0},
          {letter: "S", top: 2, left: 0},
        ],
        id: 42,
        rowIndex: 5,
        colIndex: 0,
      }),
    ).toEqual({
      letters: [["E"], ["T"], ["S"]],
      id: 42,
      solutionTop: 5,
      solutionLeft: 0,
    });
  });

  test("horizontal 3x1", () => {
    expect(
      assemblePiece({
        pieceData: [
          {letter: "D", top: 0, left: 0},
          {letter: "G", top: 0, left: 1},
          {letter: "E", top: 0, left: 2},
        ],
        id: 101,
        rowIndex: 0,
        colIndex: 3,
      }),
    ).toEqual({
      letters: [["D", "G", "E"]],
      id: 101,
      solutionTop: 0,
      solutionLeft: 3,
    });
  });

  test("cross", () => {
    expect(
      assemblePiece({
        pieceData: [
          {letter: "Z", top: 0, left: 0},
          {letter: "R", top: 1, left: 0},
          {letter: "S", top: 1, left: 1},
          {letter: "A", top: 1, left: -1},
          {letter: "Y", top: 2, left: 0},
        ],
        id: 101,
        rowIndex: 4,
        colIndex: 2,
      }),
    ).toEqual({
      letters: [
        ["", "Z", ""],
        ["A", "R", "S"],
        ["", "Y", ""],
      ],
      id: 101,
      solutionTop: 4,
      solutionLeft: 1,
    });
  });

  test("right angle", () => {
    expect(
      assemblePiece({
        pieceData: [
          {letter: "O", top: 0, left: 0},
          {letter: "F", top: 0, left: 1},
          {letter: "U", top: 1, left: 0},
          {letter: "F", top: 0, left: 2},
          {letter: "S", top: 2, left: 0},
        ],
        id: 0,
        rowIndex: 0,
        colIndex: 1,
      }),
    ).toEqual({
      letters: [
        ["O", "F", "F"],
        ["U", "", ""],
        ["S", "", ""],
      ],
      id: 0,
      solutionTop: 0,
      solutionLeft: 1,
    });
  });
});
