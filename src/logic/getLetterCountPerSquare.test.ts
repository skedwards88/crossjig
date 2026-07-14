import type {PieceInBoard, PieceInDrag} from "../Types";
import {getLetterCountPerSquare} from "./getLetterCountPerSquare";

describe("getLetterCountPerSquare", () => {
  test("case where no pieces overlap and all pieces are on board", () => {
    const pieces: PieceInBoard[] = [
      {
        letters: [["E"], ["D"]],
        id: 3,
        solutionTop: 4,
        solutionLeft: 2,
        boardLeft: 2,
        boardTop: 4,
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
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
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
      },
      {
        letters: [["L", "E", "T"]],
        id: 1,
        solutionTop: 1,
        solutionLeft: 5,
        boardLeft: 5,
        boardTop: 1,
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
      },
      {
        letters: [["I"], ["B"], ["R"]],
        id: 2,
        solutionTop: 2,
        solutionLeft: 4,
        boardTop: 7,
        boardLeft: 1,
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
      },
      {
        letters: [["P", "T"]],
        id: 5,
        solutionTop: 6,
        solutionLeft: 6,
        boardLeft: 7,
        boardTop: 7,
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
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
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
      },
    ];

    const expected = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    expect(getLetterCountPerSquare(10, 10, pieces)).toEqual(expected);
  });

  test("case where some pieces overlap and all pieces are on board", () => {
    const pieces: PieceInBoard[] = [
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
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
      },
      {
        letters: [["I"], ["B"], ["R"]],
        id: 2,
        solutionTop: 2,
        solutionLeft: 4,
        boardTop: 7,
        boardLeft: 1,
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
      },
      {
        letters: [["P", "T"]],
        id: 5,
        solutionTop: 6,
        solutionLeft: 6,
        boardLeft: 7,
        boardTop: 7,
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
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
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
      },
      {
        letters: [["E"], ["D"]],
        id: 3,
        solutionTop: 4,
        solutionLeft: 2,
        boardLeft: 2,
        boardTop: 0,
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
      },
      {
        letters: [["L", "E", "T"]],
        id: 1,
        solutionTop: 1,
        solutionLeft: 5,
        boardLeft: 1,
        boardTop: 1,
        poolIndex: undefined,
        dragGroupLeft: undefined,
        dragGroupTop: undefined,
      },
    ];

    const expected = [
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 3, 2, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    expect(getLetterCountPerSquare(10, 10, pieces)).toEqual(expected);
  });

  test("case where no pieces overlap and all pieces are in drag. The pieces are moved to top left due to how dragGroupTop/Left are calculated", () => {
    const pieces: PieceInDrag[] = [
      {
        letters: [["E"], ["D"]],
        id: 3,
        solutionTop: 4,
        solutionLeft: 2,
        dragGroupTop: 3,
        dragGroupLeft: 0,
        poolIndex: undefined,
        boardLeft: undefined,
        boardTop: undefined,
      },
      {
        letters: [["L", "E", "T"]],
        id: 1,
        solutionTop: 1,
        solutionLeft: 5,
        dragGroupTop: 0,
        dragGroupLeft: 3,
        poolIndex: undefined,
        boardLeft: undefined,
        boardTop: undefined,
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
        dragGroupTop: 0,
        dragGroupLeft: 0,
        poolIndex: undefined,
        boardLeft: undefined,
        boardTop: undefined,
      },
    ];
    const expected = [
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    expect(getLetterCountPerSquare(10, 10, pieces)).toEqual(expected);
  });

  test("case where some pieces overlap and all pieces are in drag. The pieces are moved to top left due to how dragGroupTop/Left are calculated", () => {
    const pieces: PieceInDrag[] = [
      {
        letters: [
          ["", "A", ""],
          ["C", "R", "Y"],
          ["", "Y", ""],
        ],
        id: 4,
        solutionTop: 5,
        solutionLeft: 3,
        dragGroupTop: 0,
        dragGroupLeft: 0,
        poolIndex: undefined,
        boardLeft: undefined,
        boardTop: undefined,
      },
      {
        letters: [["I"], ["B"], ["R"]],
        id: 2,
        solutionTop: 2,
        solutionLeft: 4,
        dragGroupTop: 1,
        dragGroupLeft: 0,
        poolIndex: undefined,
        boardLeft: undefined,
        boardTop: undefined,
      },
      {
        letters: [["P", "T"]],
        id: 5,
        solutionTop: 6,
        solutionLeft: 6,
        dragGroupTop: 1,
        dragGroupLeft: 2,
        poolIndex: undefined,
        boardLeft: undefined,
        boardTop: undefined,
      },
    ];
    const expected = [
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 1, 2, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    expect(getLetterCountPerSquare(10, 10, pieces)).toEqual(expected);
  });

  test("case where single pool piece is in drag", () => {
    const pieces: PieceInDrag[] = [
      {
        letters: [
          ["", "A", ""],
          ["C", "R", "Y"],
          ["", "Y", ""],
        ],
        id: 4,
        solutionTop: 5,
        solutionLeft: 3,
        dragGroupTop: 0,
        dragGroupLeft: 0,
        poolIndex: undefined,
        boardLeft: undefined,
        boardTop: undefined,
      },
    ];

    const expected = [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];

    expect(getLetterCountPerSquare(3, 3, pieces)).toEqual(expected);
  });
});
