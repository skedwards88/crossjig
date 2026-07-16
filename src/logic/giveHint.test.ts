import {giveHint} from "./giveHint";
import type {GameStateRandom, PieceInGame} from "../Types";

function fillInUndefinedPieceFields(
  partialPiece: {
    id: number;
    solutionTop: number;
    solutionLeft: number;
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
    const state = fillInUndefinedStateFields({});

    const snapshot = structuredClone(state);

    giveHint(state);

    expect(state).toEqual(snapshot);
  });

  test("returns an empty array when there are no pieces", () => {
    const state = fillInUndefinedStateFields({pieces: []});

    expect(giveHint(state)).toEqual([]);
  });

  test("when no piece is on the board, places the first off-board piece onto the board at its solution position", () => {
    const pieces = [{solutionTop: 1, solutionLeft: 1}].map((piece, index) =>
      fillInUndefinedPieceFields({id: index, poolIndex: index, ...piece}),
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

  test("when some pieces are on the board but are misaligned, aligns those pieces but doesn't touch the pieces in the pool (case where the first board piece is at official solution)", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 3, solutionLeft: 5, boardTop: 3, boardLeft: 5},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 2, solutionLeft: 2, boardTop: 3, boardLeft: 5},
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) => fillInUndefinedPieceFields({id: index, ...piece}));

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

  test("when some pieces are on the board but are misaligned, aligns those pieces but doesn't touch the pieces in the pool (case where the first board piece can shift to official solution)", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 3, solutionLeft: 5, boardTop: 2, boardLeft: 7},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 2, solutionLeft: 2, boardTop: 3, boardLeft: 5},
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) => fillInUndefinedPieceFields({id: index, ...piece}));

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

  test("when some pieces are on the board but are misaligned, aligns those pieces but doesn't touch the pieces in the pool (case where the first board piece is too far off to shift to official solution but second board piece is not)", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 3, solutionLeft: 5, boardTop: 2, boardLeft: 7},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 2, solutionLeft: 2, boardTop: 3, boardLeft: 1},
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) => fillInUndefinedPieceFields({id: index, ...piece}));

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

  test("when some pieces are on the board but are misaligned, aligns those pieces but doesn't touch the pieces in the pool (case where all board pieces are past the max shift range)", () => {
    const pieces = [
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 3, solutionLeft: 5, boardTop: 2, boardLeft: 7},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 2, solutionLeft: 2, boardTop: 4, boardLeft: 1},
      {solutionTop: 4, solutionLeft: 1, boardTop: 3, boardLeft: 5},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) => fillInUndefinedPieceFields({id: index, ...piece}));

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

  test("when all board pieces are at the same shift from their official solution spots but the shift is outside the max shift range, aligns the pieces", () => {
    const pieces = [
      {solutionTop: 3, solutionLeft: 5, boardTop: 5, boardLeft: 3},
      {solutionTop: 2, solutionLeft: 2, boardTop: 4, boardLeft: 0},
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 4, solutionLeft: 3, boardTop: 6, boardLeft: 1},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) => fillInUndefinedPieceFields({id: index, ...piece}));

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

  test("when all board pieces are at their official solution spots, adds a new piece to the board", () => {
    const pieces = [
      {solutionTop: 3, solutionLeft: 5, boardTop: 3, boardLeft: 5},
      {solutionTop: 2, solutionLeft: 2, boardTop: 2, boardLeft: 2},
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 4, solutionLeft: 1, boardTop: 4, boardLeft: 1},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) => fillInUndefinedPieceFields({id: index, ...piece}));

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

  test("when all board pieces are at the same shift from their official solution spots and the shift is within the max shift range, adds a new piece to the board", () => {
    const pieces = [
      {solutionTop: 3, solutionLeft: 5, boardTop: 5, boardLeft: 3},
      {solutionTop: 2, solutionLeft: 2, boardTop: 4, boardLeft: 0},
      {solutionTop: 1, solutionLeft: 1, poolIndex: 1},
      {solutionTop: 5, solutionLeft: 2, poolIndex: 2},
      {solutionTop: 4, solutionLeft: 3, boardTop: 6, boardLeft: 1},
      {solutionTop: 3, solutionLeft: 3, poolIndex: 3},
    ].map((piece, index) => fillInUndefinedPieceFields({id: index, ...piece}));

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
});
