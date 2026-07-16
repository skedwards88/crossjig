import {gameInit} from "./gameInit";
import type {GameState} from "../Types";
import {gameSolvedQ} from "./gameSolvedQ";
import {dragReducer, type DragReducerPayload} from "./dragReducer";
import {giveHint} from "./giveHint";

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
