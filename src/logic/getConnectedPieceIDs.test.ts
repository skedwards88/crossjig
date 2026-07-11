import type {PieceInGame} from "../Types";
import {getConnectedPieceIDs} from "./getConnectedPieceIDs";

describe("getConnectedPieceIDs", () => {
  test("case where another piece is touching the dragged piece", () => {
    const pieces: PieceInGame[] = [
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
        letters: [["I"], ["B"], ["R"]],
        id: 2,
        solutionTop: 2,
        solutionLeft: 4,
        poolIndex: 0,
        boardLeft: undefined,
        boardTop: undefined,
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
    ];

    expect(
      getConnectedPieceIDs({
        pieces,
        gridSize: 10,
        draggedPieceID: 5,
      }),
    ).toEqual([5, 4]);
  });

  test("case where another piece is not touching the dragged piece", () => {
    const pieces: PieceInGame[] = [
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
    ];

    expect(
      getConnectedPieceIDs({
        pieces,
        gridSize: 10,
        draggedPieceID: 2,
      }),
    ).toEqual([2]);
  });
});
