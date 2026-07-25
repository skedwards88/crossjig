import {giveHint} from "./giveHint";
import type {
  GameStateRandom,
  Letter,
  LetterOrEmpty,
  PieceInGame,
} from "../Types";

function numberToLetter(number: number): Letter {
  const letters: Letter[] = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  return letters[number % letters.length];
}
function fillInUndefinedPieceFields(
  partialPiece: {
    id: number;
    solutionTop: number;
    solutionLeft: number;
    letters?: LetterOrEmpty[][];
  } & ({poolIndex: number} | {boardTop: number; boardLeft: number}),
): PieceInGame {
  return {
    letters: [[]],
    boardTop: undefined,
    boardLeft: undefined,
    poolIndex: undefined,
    dragGroupLeft: undefined,
    dragGroupTop: undefined,
    ...partialPiece,
  };
}

function fillInUndefinedStateFields(
  state: Partial<GameStateRandom>,
): GameStateRandom {
  return {
    pieces: [],
    gridSize: 10,
    dragCount: 0,
    dragState: undefined,
    seed: "test",
    maxShiftLeft: 100,
    maxShiftRight: 100,
    maxShiftUp: 100,
    maxShiftDown: 100,
    numLetters: 50,
    allPiecesAreUsed: false,
    gameIsSolved: false,
    gameIsSolvedReason: "",
    hintTally: 0,
    isResumedFromSave: false,
    isCustomCreating: false,
    isCustom: false,
    isDaily: false,
    isAdventure: false,
    ...state,
  };
}

describe("giveHint", () => {
  test("does not mutate the original state", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {
        solutionTop: 3,
        solutionLeft: 5,
        poolIndex: 2,
        id: 111,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 1,
        solutionLeft: 1,
        boardTop: 3,
        boardLeft: 5,
        id: 222,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 3},
      {solutionTop: 2, solutionLeft: 2, boardTop: 2, boardLeft: 2},
      {solutionTop: 4, solutionLeft: 1, boardTop: 4, boardLeft: 1},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const snapshot = structuredClone(state);

    giveHint(state);

    expect(state).toEqual(snapshot);
  });

  test("returns an empty array when there are no pieces", () => {
    const state = fillInUndefinedStateFields({pieces: []});

    expect(giveHint(state)).toEqual([]);
  });

  test("if all pieces are in place, returns the pieces unchanged", () => {
    const pieces = [
      {solutionTop: 2, solutionLeft: 2, boardTop: 2, boardLeft: 2},
      {solutionTop: 4, solutionLeft: 1, boardTop: 4, boardLeft: 1},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);
    expect(result).toEqual(pieces);
  });

  test("if all pieces are in place just shifted equally from solution, returns the pieces unchanged", () => {
    const pieces = [
      {solutionTop: 2, solutionLeft: 2, boardTop: 1, boardLeft: 4},
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 3},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);
    expect(result).toEqual(pieces);
  });

  test("when no piece is on the board, places the first off-board piece onto the board at its solution position", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1},
      {solutionTop: 3, solutionLeft: 1},
      {solutionTop: 3, solutionLeft: 2},
      {solutionTop: 4, solutionLeft: 6},
      {solutionTop: 4, solutionLeft: 3},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        poolIndex: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    const expectedNewPiece = {
      ...state.pieces[0],
      boardLeft: state.pieces[0].solutionLeft,
      boardTop: state.pieces[0].solutionTop,
      poolIndex: undefined,
      dragGroupLeft: undefined,
      dragGroupTop: undefined,
    };

    expect(result[0]).toMatchObject(expectedNewPiece);

    for (let index = 1; index < state.pieces.length; index++) {
      expect(result[index]).toMatchObject(state.pieces[index]);
    }
  });

  test("board/pool mix, no duplicates, first board piece at solution (so overall shift 0), other board pieces not at solution: board pieces will move to original solution with no offset, pool pieces remain untouched", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 3, solutionLeft: 5, boardTop: 3, boardLeft: 5}, // sets overall shift to 0, 0; will not shift to match solution
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 2, solutionLeft: 2, boardTop: 3, boardLeft: 5}, // will shift to match solution
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5}, // will shift to match solution
      {solutionTop: 4, solutionLeft: 1, boardTop: 4, boardLeft: 1}, // will not shift to match solution
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // Pool pieces untouched
      if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      } else {
        // board pieces moved to original solution
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("board/pool mix, no duplicates, first board piece within shift range of solution, other board pieces not at solution: board pieces will move to original solution with offset set by first piece, pool pieces remain untouched", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 3, solutionLeft: 5, boardTop: 2, boardLeft: 7}, // sets overall shift to -1, 2
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 2, solutionLeft: 2, boardTop: 3, boardLeft: 5},
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // Pool pieces untouched
      if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      } else {
        // board pieces moved to original solution with offset top -1, left 2
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop - 1);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft + 2);
      }
    }
  });

  test("board/pool mix, no duplicates, first board piece outside of shift range, second board piece within shift range of solution, other board pieces not at solution: board pieces will move to original solution with offset set by second piece, pool pieces remain untouched", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 3, solutionLeft: 5, boardTop: 2, boardLeft: 7}, // outside of shift range
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 2, solutionLeft: 2, boardTop: 3, boardLeft: 1}, // sets shift to 1, -1
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
      maxShiftLeft: 1,
      maxShiftDown: 1,
      maxShiftUp: 1,
      maxShiftRight: 1,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // Pool pieces untouched
      if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      } else {
        // board pieces moved to original solution with offset top 1, left -1
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop + 1);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft - 1);
      }
    }
  });

  test("board/pool mix, no duplicates, all board pieces are past the max shift range: board pieces will move to original solution with no offset, pool pieces remain untouched", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 3, solutionLeft: 5, boardTop: 2, boardLeft: 7},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 2, solutionLeft: 2, boardTop: 4, boardLeft: 1},
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
      maxShiftLeft: 1,
      maxShiftDown: 1,
      maxShiftUp: 1,
      maxShiftRight: 1,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // Pool pieces untouched
      if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      } else {
        // board pieces moved to original solution
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("board/pool mix, no duplicates, all board pieces require the same shift but are past the max shift range: board pieces will move to original solution with no offset, pool pieces remain untouched", () => {
    const pieces = [
      {solutionTop: 3, solutionLeft: 5, boardTop: 5, boardLeft: 3},
      {solutionTop: 2, solutionLeft: 2, boardTop: 4, boardLeft: 0},
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 4, solutionLeft: 3, boardTop: 6, boardLeft: 1},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
      maxShiftLeft: 1,
      maxShiftDown: 1,
      maxShiftUp: 1,
      maxShiftRight: 1,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // Pool pieces untouched
      if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      } else {
        // board pieces moved to original solution
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("board/pool mix, no duplicates, all board pieces are at their official solution spots: piece moved from pool to board, all other pieces remain untouched", () => {
    const pieces = [
      {solutionTop: 3, solutionLeft: 5, boardTop: 3, boardLeft: 5},
      {solutionTop: 2, solutionLeft: 2, boardTop: 2, boardLeft: 2},
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 4, solutionLeft: 1, boardTop: 4, boardLeft: 1},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
      maxShiftLeft: 1,
      maxShiftDown: 1,
      maxShiftUp: 1,
      maxShiftRight: 1,
    });

    const result = giveHint(state);

    const adjustedIndex = 2;

    expect(result[adjustedIndex].poolIndex).toBe(undefined);

    expect(result[adjustedIndex].boardTop).toBe(
      state.pieces[adjustedIndex].solutionTop,
    );

    expect(result[adjustedIndex].boardLeft).toBe(
      state.pieces[adjustedIndex].solutionLeft,
    );

    // other pieces untouched
    for (let index = 0; index < state.pieces.length; index++) {
      if (index === adjustedIndex) continue;

      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      expect(updatedPiece).toMatchObject(originalPiece);
    }
  });

  test("board/pool mix, no duplicates, all board pieces are at the same shift from their official solution spots and the shift is within the max shift range: piece moved from pool to board, all other pieces remain untouched", () => {
    const pieces = [
      {solutionTop: 3, solutionLeft: 5, boardTop: 5, boardLeft: 3}, // sets overall shift to 2, -2
      {solutionTop: 2, solutionLeft: 2, boardTop: 4, boardLeft: 0},
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 4, solutionLeft: 3, boardTop: 6, boardLeft: 1},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
      maxShiftLeft: 2,
      maxShiftDown: 2,
      maxShiftUp: 2,
      maxShiftRight: 2,
    });

    const result = giveHint(state);

    const adjustedIndex = 2;

    expect(result[adjustedIndex].poolIndex).toBe(undefined);

    expect(result[adjustedIndex].boardTop).toBe(
      state.pieces[adjustedIndex].solutionTop + 2,
    );

    expect(result[adjustedIndex].boardLeft).toBe(
      state.pieces[adjustedIndex].solutionLeft - 2,
    );

    // other pieces untouched
    for (let index = 0; index < state.pieces.length; index++) {
      if (index === adjustedIndex) continue;

      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      expect(updatedPiece).toMatchObject(originalPiece);
    }
  });

  test("board/pool mix, duplicate pieces in the board (1) and pool (1), duplicate is not touching anything, the duplicate in the board is at the correct location for the duplicate piece in the pool, other board pieces require a shift: the duplicate pieces swap locations, board pieces will get aligned, pool pieces remain untouched", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {
        solutionTop: 3,
        solutionLeft: 5,
        poolIndex: 2,
        id: 111,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 1,
        solutionLeft: 1,
        boardTop: 3,
        boardLeft: 5, // this along with the other duplicate sets overall shift to 0, 0
        id: 222,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 3},
      {solutionTop: 2, solutionLeft: 2, boardTop: 1, boardLeft: 2},
      {solutionTop: 4, solutionLeft: 1, boardTop: 2, boardLeft: 2},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // The duplicate that was in the pool is now on the board at the duplicate's old board indexes
      if (originalPiece.id === 111) {
        expect(updatedPiece.boardTop).toBe(3);
        expect(updatedPiece.boardLeft).toBe(5);
        expect(updatedPiece.poolIndex).toBe(undefined);
      }
      // The duplicate that was on the board is now in the pool at the duplicate's old pool index
      else if (originalPiece.id === 222) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(2);
      }
      // other pool pieces untouched
      else if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      }
      // other board pieces moved to original solution
      else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("board/pool mix, duplicate pieces in the board (1) and pool (1), duplicate is not touching anything, the duplicate in the board is at the correct location for the duplicate piece in the pool, other board pieces don't require a shift: the duplicate pieces swap locations, other board pieces remain untouched, and a new piece is added to the board", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {
        solutionTop: 3,
        solutionLeft: 5,
        poolIndex: 2,
        id: 111,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 1,
        solutionLeft: 1,
        boardTop: 3,
        boardLeft: 5,
        id: 222,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 3},
      {solutionTop: 2, solutionLeft: 2, boardTop: 2, boardLeft: 2},
      {solutionTop: 4, solutionLeft: 1, boardTop: 4, boardLeft: 1},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    // Piece added from pool
    const adjustedIndex = 0;

    expect(result[adjustedIndex].poolIndex).toBe(undefined);

    expect(result[adjustedIndex].boardTop).toBe(
      state.pieces[adjustedIndex].solutionTop,
    );

    expect(result[adjustedIndex].boardLeft).toBe(
      state.pieces[adjustedIndex].solutionLeft,
    );

    for (let index = 0; index < state.pieces.length; index++) {
      if (index === adjustedIndex) continue;

      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // The duplicate that was in the pool is now on the board at the duplicate's old board indexes
      if (originalPiece.id === 111) {
        expect(updatedPiece.boardTop).toBe(3);
        expect(updatedPiece.boardLeft).toBe(5);
        expect(updatedPiece.poolIndex).toBe(undefined);
      }
      // The duplicate that was on the board is now in the pool at the duplicate's old pool index
      else if (originalPiece.id === 222) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(2);
      }
      // other pool pieces untouched
      else if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      }
      // other board pieces moved to original solution
      else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("board/pool mix, duplicate pieces in the board (1) and pool (1), duplicate is not touching anything, the duplicate in the board is at the correct location for the duplicate piece in the pool but requires a shift: the duplicate pieces swap locations, board pieces will get aligned, pool pieces remain untouched", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 2, solutionLeft: 4, boardTop: 1, boardLeft: 6}, // sets the shift to -1, 2
      {
        solutionTop: 3,
        solutionLeft: 5,
        poolIndex: 2,
        id: 111,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 100,
        solutionLeft: 100,
        boardTop: 3,
        boardLeft: 5,
        id: 222,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 3},
      {solutionTop: 4, solutionLeft: 1, boardTop: 1, boardLeft: 1},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // The piece that was in the pool is now on the board at the correct spot with offset top -1, left 2
      if (originalPiece.id === 111) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop - 1);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft + 2);
        expect(updatedPiece.poolIndex).toBe(undefined);
      }
      // The piece that was on the board is now in the pool at the duplicate's old pool index
      else if (originalPiece.id === 222) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(2);
      }
      // other pool pieces untouched
      else if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      }
      // other board pieces moved to original solution with offset top -1, left 2
      else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop - 1);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft + 2);
      }
    }
  });

  test("board/pool mix, duplicate pieces in the board (2) and pool (2), duplicates are not touching anything, commonest shift is 0, overall shift is 0: the duplicates with a realignment closest to the realignment most often applied to the non-duplicate pieces are put on the board at their solution spot and the rest are put in the pool", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 5, solutionLeft: 5, boardTop: 5, boardLeft: 5}, // sets overall shift to 0, 0
      {
        solutionTop: 2,
        solutionLeft: 0,
        poolIndex: 2,
        id: 111,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 1,
        solutionLeft: 3,
        // is close to 111 solution
        boardTop: 3,
        boardLeft: 0,
        id: 222,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 6,
        solutionLeft: 5,
        // is close to 111 and 222 solution
        boardTop: 2,
        boardLeft: 2,
        id: 333,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 7,
        solutionLeft: 3,
        poolIndex: 6,
        id: 444,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 3},
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // Was in the pool and and piece 222 was near its location; is now on the board at its solution
      if (originalPiece.id === 111) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      }
      // Was on the board close to 111 solution and piece 333 was near its location; is now on the board at its solution
      else if (originalPiece.id === 222) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      }
      // Was on the board close to 222 with no piece close to its solution; is now in the pool
      else if (originalPiece.id === 333) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(6);
      }
      // Was in the pool with no piece close to its solution; is still in the pool
      else if (originalPiece.id === 444) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(2);
      }
      // other pool pieces untouched
      else if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      }
      // other board pieces moved to original solution with offset 0, 0
      else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("board/pool mix, duplicate pieces in the board (2) and pool (2), duplicates are not touching anything, commonest shift is not 0, overall shift is 0: the duplicates with a realignment closest to the realignment most often applied to the non-duplicate pieces are put on the board at their solution spot and the rest are put in the pool", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 5, solutionLeft: 5, boardTop: 5, boardLeft: 5}, // sets overall shift to 0, 0
      {solutionTop: 4, solutionLeft: 3, boardTop: 0, boardLeft: 0},
      {solutionTop: 4, solutionLeft: 3, boardTop: 0, boardLeft: 0}, // but commonest shift is -4, -3
      {
        solutionTop: 2,
        solutionLeft: 0,
        poolIndex: 2,
        id: 111,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 1,
        solutionLeft: 3,
        // is close to 111 solution with no shift, but with the shift is close to the 444 solution
        boardTop: 3,
        boardLeft: 0,
        id: 222,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 6,
        solutionLeft: 5,
        // is close to 111 and 222 solution with no shift, but with the shift is close to the 333 solution
        boardTop: 2,
        boardLeft: 2,
        id: 333,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 7,
        solutionLeft: 3,
        poolIndex: 6,
        id: 444,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 3},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // Was in the pool; is still in the pool
      if (originalPiece.id === 111) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(6);
      }
      // Was on the board with no piece close to its solution; is now in the pool
      else if (originalPiece.id === 222) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(2);
      }
      // Was on the board; is now shifted on the board
      else if (originalPiece.id === 333) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      }
      // Was in the pool; is now on the board
      else if (originalPiece.id === 444) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      }
      // other pool pieces untouched
      else if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      }
      // other board pieces moved to original solution with offset 0, 0
      else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("board/pool mix, duplicate pieces in the board (2) and pool (2), duplicates are not touching anything, commonest shift is not 0, overall shift is not 0: the duplicates with a realignment closest to the realignment most often applied to the non-duplicate pieces are put on the board at their solution spot and the rest are put in the pool", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 6, solutionLeft: 5, boardTop: 5, boardLeft: 5}, // sets overall shift to -1, 0
      {solutionTop: 4, solutionLeft: 3, boardTop: 0, boardLeft: 0},
      {solutionTop: 4, solutionLeft: 3, boardTop: 0, boardLeft: 0}, // but commonest shift is -3, -3
      {
        solutionTop: 2,
        solutionLeft: 0,
        poolIndex: 2,
        id: 111,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 1,
        solutionLeft: 3,
        // is close to 111 solution with no shift, but with the shift is close to the 444 solution
        boardTop: 3,
        boardLeft: 0,
        id: 222,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 6,
        solutionLeft: 5,
        // is close to 111 and 222 solution with no shift, but with the shift is close to the 333 solution
        boardTop: 2,
        boardLeft: 2,
        id: 333,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 7,
        solutionLeft: 3,
        poolIndex: 6,
        id: 444,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 3},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // Was in the pool; is still in the pool
      if (originalPiece.id === 111) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(6);
      }
      // Was on the board with no piece close to its solution; is now in the pool
      else if (originalPiece.id === 222) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(2);
      }
      // Was on the board; is now shifted on the board to original solution with offset top -1, left 0
      else if (originalPiece.id === 333) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop - 1);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      }
      // Was in the pool; is now on the board at original solution with offset top -1, left 0
      else if (originalPiece.id === 444) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop - 1);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      }
      // other pool pieces untouched
      else if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      }
      // other board pieces moved to original solution with offset top -1, left 0
      else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop - 1);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("board/pool mix, duplicate pieces in the board (2) and pool (1), board duplicates both touching a non-duplicate, one duplicate in correct spot relative to the pieces it isn't touching: realign the duplicates based on the pieces that they touch", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 4, solutionLeft: 0, boardTop: 7, boardLeft: 0}, // sets overall shift to 3, 0
      {solutionTop: 5, solutionLeft: 0, boardTop: 8, boardLeft: 0},
      {solutionTop: 5, solutionLeft: 1, boardTop: 8, boardLeft: 1},
      {solutionTop: 5, solutionLeft: 2, boardTop: 8, boardLeft: 2},
      {solutionTop: 4, solutionLeft: 2, boardTop: 7, boardLeft: 2},
      {solutionTop: 6, solutionLeft: 7, boardTop: 2, boardLeft: 4}, // is touching both duplicates
      {
        solutionTop: 5,
        solutionLeft: 5,
        boardTop: 1,
        boardLeft: 2,
        id: 111,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 7,
        solutionLeft: 6,
        poolIndex: 2,
        id: 222,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 0,
        solutionLeft: 3,
        // in the correct spot relative to the singletons that it isn't touching
        boardTop: 3,
        boardLeft: 3,
        id: 333,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 5, poolIndex: 3},
      {solutionTop: 7, solutionLeft: 6, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      if (originalPiece.id === 111) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop + 3);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      } else if (originalPiece.id === 222) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop + 3);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      } else if (originalPiece.id === 333) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(2);
      } else if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      } else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop + 3);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("board/pool mix, duplicate pieces in the board (2) and pool (1), one board duplicate touching a non-duplicate, one duplicate in correct spot: realign the duplicates based on the pieces that they touch, otherwise realign based on the overall non-duplicate pieces", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 4, solutionLeft: 0, boardTop: 7, boardLeft: 0}, // sets overall shift to 3, 0
      {solutionTop: 5, solutionLeft: 0, boardTop: 8, boardLeft: 0},
      {solutionTop: 5, solutionLeft: 1, boardTop: 8, boardLeft: 1},
      {solutionTop: 5, solutionLeft: 2, boardTop: 8, boardLeft: 2},
      {solutionTop: 4, solutionLeft: 2, boardTop: 7, boardLeft: 2},
      {solutionTop: 6, solutionLeft: 7, boardTop: 1, boardLeft: 5}, // is touching only duplicate 111
      {
        solutionTop: 5,
        solutionLeft: 5,
        boardTop: 1,
        boardLeft: 2,
        id: 111,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 7,
        solutionLeft: 6,
        poolIndex: 2,
        id: 222,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 0,
        solutionLeft: 3,
        boardTop: 3,
        boardLeft: 3,
        id: 333,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 5, poolIndex: 3},
      {solutionTop: 7, solutionLeft: 6, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      if (originalPiece.id === 111) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop + 3);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      } else if (originalPiece.id === 222) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(2);
      } else if (originalPiece.id === 333) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop + 3);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      } else if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      } else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop + 3);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("if all duplicates are in the pool, no changes are applied to them)", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 3, solutionLeft: 5, boardTop: 2, boardLeft: 7},
      {
        solutionTop: 3,
        solutionLeft: 5,
        poolIndex: 2,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 2,
        solutionLeft: 1,
        poolIndex: 5,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 1,
        solutionLeft: 4,
        poolIndex: 6,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 3},
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      //  pool pieces untouched
      if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      }
      // other board pieces moved to original solution with offset top -1, left 2
      else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop - 1);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft + 2);
      }
    }
  });

  test("all duplicates on the board, no visible shift: realign the duplicates AND add a piece to the board", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 2, solutionLeft: 2, boardTop: 2, boardLeft: 2},
      {
        solutionTop: 3,
        solutionLeft: 5,
        boardTop: 2,
        boardLeft: 7,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 2,
        solutionLeft: 7,
        boardTop: 3,
        boardLeft: 5,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 3},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    // Piece added from pool
    const adjustedIndex = 0;

    expect(result[adjustedIndex].poolIndex).toBe(undefined);

    expect(result[adjustedIndex].boardTop).toBe(
      state.pieces[adjustedIndex].solutionTop,
    );

    expect(result[adjustedIndex].boardLeft).toBe(
      state.pieces[adjustedIndex].solutionLeft,
    );

    for (let index = 0; index < state.pieces.length; index++) {
      if (index === adjustedIndex) continue;

      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      //  other pool pieces untouched
      if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      }
      // other board pieces moved to original solution
      else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("all duplicates on the board, visible shift required: realign the duplicates but don't add a piece to the board", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 2, solutionLeft: 2, boardTop: 2, boardLeft: 2},
      {
        solutionTop: 3,
        solutionLeft: 5,
        boardTop: 2,
        boardLeft: 7,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 2,
        solutionLeft: 7,
        boardTop: 3,
        boardLeft: 5,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 3},
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 4},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      //  pool pieces untouched
      if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      }
      // other board pieces moved to original solution
      else {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });

  test("a duplicate off the board can set the shift    board/pool mix, no duplicates, first board piece outside of shift range, second board piece within shift range of solution, other board pieces not at solution: board pieces will move to original solution with offset set by second piece, pool pieces remain untouched", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 3, solutionLeft: 5, boardTop: 2, boardLeft: 7}, // outside of shift range
      {
        solutionTop: 3,
        solutionLeft: 5,
        poolIndex: 2,
        id: 111,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {
        solutionTop: 1,
        solutionLeft: 1,
        boardTop: 2,
        boardLeft: 6, // this along with the other duplicate sets overall shift to -1, 1
        id: 222,
        letters: [["D", "U", "P"]] as LetterOrEmpty[][],
      },
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 2, solutionLeft: 2, boardTop: 3, boardLeft: 1}, // sets shift to 1, -1
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({
      pieces,
      maxShiftLeft: 1,
      maxShiftDown: 1,
      maxShiftUp: 1,
      maxShiftRight: 1,
    });

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      // The duplicate that was in the pool is now on the board at the duplicate's old board indexes with offset 1, -1
      if (originalPiece.id === 111) {
        expect(updatedPiece.boardTop).toBe(3 - 1);
        expect(updatedPiece.boardLeft).toBe(5 + 1);
        expect(updatedPiece.poolIndex).toBe(undefined);
      }
      // The duplicate that was on the board is now in the pool at the duplicate's old pool index
      else if (originalPiece.id === 222) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(2);
      }
      // other pool pieces untouched
      else if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      } else {
        // board pieces moved to original solution with offset 1, -1
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop - 1);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft + 1);
      }
    }
  });

  test("two separate duplicate groups touching each other: the shift of the first group is used for the shift of the second group", () => {
    const pieces = [
      // sets overall shift to 0,0
      {solutionTop: 0, solutionLeft: 0, boardTop: 0, boardLeft: 0},
      {solutionTop: 0, solutionLeft: 0, boardTop: 0, boardLeft: 0},
      {solutionTop: 0, solutionLeft: 0, boardTop: 0, boardLeft: 0},
      {solutionTop: 0, solutionLeft: 0, boardTop: 0, boardLeft: 0},
      {solutionTop: 0, solutionLeft: 1, boardTop: 0, boardLeft: 1},
      // should get moved to solution
      {
        solutionTop: 7,
        solutionLeft: 6,
        boardTop: 2,
        boardLeft: 2,
        id: 111,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      // should get moved to solution
      {
        solutionTop: 6,
        solutionLeft: 5,
        boardTop: 3,
        boardLeft: 3,
        id: 222,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      // should stay in pool
      {
        solutionTop: 10,
        solutionLeft: 10,
        poolIndex: 1,
        id: 333,
        letters: [["D", "U"]] as LetterOrEmpty[][],
      },
      // should move to board
      {
        solutionTop: 8,
        solutionLeft: 5,
        poolIndex: 2,
        id: 444,
        letters: [["P", "L"]] as LetterOrEmpty[][],
      },
      // should move to pool even though it is close to its actual solution
      {
        solutionTop: 4,
        solutionLeft: 0,
        boardTop: 4,
        boardLeft: 2,
        id: 555,
        letters: [["P", "L"]] as LetterOrEmpty[][],
      },
    ].map((piece, index) =>
      fillInUndefinedPieceFields({
        id: index,
        letters: [[numberToLetter(index)]],
        ...piece,
      }),
    );

    const state = fillInUndefinedStateFields({pieces});

    const result = giveHint(state);

    for (let index = 0; index < state.pieces.length; index++) {
      const originalPiece = state.pieces[index];
      const updatedPiece = result[index];
      if (originalPiece.id === 444) {
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
        expect(updatedPiece.poolIndex).toBe(undefined);
      } else if (originalPiece.id === 555) {
        expect(updatedPiece.boardTop).toBe(undefined);
        expect(updatedPiece.boardLeft).toBe(undefined);
        expect(updatedPiece.poolIndex).toBe(2);
      }
      // other pool pieces untouched
      else if (originalPiece.poolIndex != undefined) {
        expect(updatedPiece).toMatchObject(originalPiece);
      } else {
        // board pieces moved to original solution with offset 0, 0
        expect(updatedPiece.boardTop).toBe(originalPiece.solutionTop);
        expect(updatedPiece.boardLeft).toBe(originalPiece.solutionLeft);
      }
    }
  });
});
