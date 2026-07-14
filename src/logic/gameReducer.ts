import {gameInit} from "./gameInit";
import type {GameState, PieceInGame, PieceInBoard, PieceInPool} from "../Types";
import {gameSolvedQ} from "./gameSolvedQ";
import {dragReducer, type DragReducerPayload} from "./dragReducer";

export type GameReducerPayload =
  | {
      action: "newGame";
      numLetters: number;
    }
  | {
      action: "newGame";
      seed: string;
      isCustom: true;
    }
  | {action: "getHint"}
  | DragReducerPayload;

function giveHint(currentState: GameState): PieceInGame[] {
  const pieces = structuredClone(currentState.pieces);
  const {maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown} = currentState;

  let shiftLeft;
  let shiftUp;
  // check each piece until we find one on the board within the shift range
  for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
    const {boardLeft, boardTop, solutionLeft, solutionTop} = pieces[pieceIndex];
    // if the piece is not on the board, skip to the next piece
    if (boardLeft === undefined || boardTop === undefined) {
      continue;
    }
    // if the piece is on the board, check whether it is within the shift range
    //   if yes, set the shift and break loop
    const actualShiftLeft = solutionLeft - boardLeft;
    const actualShiftUp = solutionTop - boardTop;
    if (
      actualShiftLeft <= maxShiftLeft &&
      actualShiftUp <= maxShiftUp &&
      -1 * actualShiftLeft <= maxShiftRight &&
      -1 * actualShiftUp <= maxShiftDown
    ) {
      shiftLeft = actualShiftLeft;
      shiftUp = actualShiftUp;
      break;
    }
  }

  let realignedPieces: PieceInGame[] = [];
  let numRealigned = 0;
  // if we found a piece on the board that is within the shift range, realign all other pieces on the board to match if they don't already
  if (shiftLeft != undefined && shiftUp != undefined) {
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      const {boardLeft, boardTop, solutionLeft, solutionTop} =
        pieces[pieceIndex];
      // if the piece is not on the board, skip to the next piece
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces.push(pieces[pieceIndex]);
        continue;
      }
      const newLeft = solutionLeft - shiftLeft;
      const newTop = solutionTop - shiftUp;
      const realignedPiece = {
        ...(pieces[pieceIndex] as PieceInBoard),
        boardLeft: newLeft,
        boardTop: newTop,
        poolIndex: undefined,
      };
      realignedPieces.push(realignedPiece);
      if (boardLeft != newLeft || boardTop != newTop) {
        numRealigned++;
      }
    }
  } else {
    // if didn't find any pieces on the board within the shift range,
    //   move all pieces on the board into place
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      const {boardLeft, boardTop, solutionLeft, solutionTop} =
        pieces[pieceIndex];
      // if the piece is not on the board, skip to the next piece
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces = [...realignedPieces, pieces[pieceIndex]];
        continue;
      }
      const realignedPiece = {
        ...(pieces[pieceIndex] as PieceInBoard),
        boardLeft: solutionLeft,
        boardTop: solutionTop,
        poolIndex: undefined,
      };
      realignedPieces.push(realignedPiece);
      if (boardLeft != solutionLeft || boardTop != solutionTop) {
        numRealigned++;
      }
    }
  }

  // if we didn't need to move any pieces that are already on the board, move one new piece onto the board
  if (!numRealigned) {
    realignedPieces = [...pieces];
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      const {boardLeft, boardTop, solutionLeft, solutionTop} =
        pieces[pieceIndex];
      // if the piece is not on the board, add it to the board and break the loop
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces[pieceIndex] = {
          ...(pieces[pieceIndex] as PieceInPool),
          boardLeft: shiftLeft ? solutionLeft - shiftLeft : solutionLeft,
          boardTop: shiftUp ? solutionTop - shiftUp : solutionTop,
          poolIndex: undefined,
        };
        break;
      }
    }
  }

  return realignedPieces;
}

function getCompletionData(currentState: GameState): {
  allPiecesAreUsed: boolean;
  gameIsSolved: boolean;
  gameIsSolvedReason: string;
} {
  const {gameIsSolved, reason: gameIsSolvedReason} = gameSolvedQ(
    currentState.pieces,
    currentState.gridSize,
  );

  return {
    allPiecesAreUsed: gameIsSolvedReason != "All pieces must be used",
    gameIsSolved: gameIsSolved,
    gameIsSolvedReason: gameIsSolvedReason,
  };
}

export function updateCompletionState<S extends GameState>(gameState: S): S {
  return {
    ...gameState,
    ...getCompletionData(gameState),
  };
}

export function gameReducer<S extends GameState>(
  currentState: S,
  payload: GameReducerPayload,
): S {
  if (payload.action === "newGame") {
    if ("isCustom" in payload && payload.isCustom) {
      return gameInit({
        isCustom: true,
        seed: payload.seed,
        useSaved: false,
      }) as S;
    } else {
      return gameInit({
        ...("numLetters" in payload && {numLetters: payload.numLetters}), // overly verbose checking for TS
        useSaved: false,
      }) as S;
    }
  } else if (payload.action === "getHint") {
    const newPieces = giveHint(currentState);

    const updatedState = updateCompletionState({
      ...currentState,
      pieces: newPieces,
      hintTally: currentState.hintTally + 1,
    });

    return updatedState;
  } else {
    return dragReducer(currentState, payload);
  }
}
