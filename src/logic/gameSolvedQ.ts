import {crosswordValidQ} from "@skedwards88/word_logic";
import {trie} from "../logic/trie";
import {getStringsFromPieces} from "./getStringsFromPieces";
import type {PieceInGame, PieceInBoard, LetterOrEmpty} from "../Types";

function getPieceOverlaps(
  boardPieces: PieceInBoard[],
  gridSize: number,
): {piecesOverlap: boolean; grid: LetterOrEmpty[][]} {
  let overlappingPiecesQ = false;

  const grid: LetterOrEmpty[][] = Array.from({length: gridSize}, () =>
    Array.from({length: gridSize}, () => ""),
  );

  for (let index = 0; index < boardPieces.length; index++) {
    const letters = boardPieces[index].letters;
    let top = boardPieces[index].boardTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = boardPieces[index].boardLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        if (letters[rowIndex][colIndex]) {
          if (grid[top][left]) {
            overlappingPiecesQ = true;
            break;
          }
          grid[top][left] = letters[rowIndex][colIndex];
        }
        left += 1;
      }
      if (overlappingPiecesQ) {
        break;
      }
      top += 1;
    }
    if (overlappingPiecesQ) {
      break;
    }
  }
  return {piecesOverlap: overlappingPiecesQ, grid};
}

export function gameSolvedQ(
  pieces: PieceInGame[],
  gridSize: number,
): {
  gameIsSolved: boolean;
  reason: string;
} {
  const allPiecesAreUsed = pieces.every(
    (piece) => piece.boardTop != undefined && piece.boardLeft != undefined,
  );

  if (!allPiecesAreUsed) {
    return {
      gameIsSolved: false,
      reason: "All pieces must be used",
    };
  }

  const {piecesOverlap, grid} = getPieceOverlaps(pieces, gridSize);

  if (piecesOverlap) {
    return {
      gameIsSolved: false,
      reason: "No pieces may overlap",
    };
  }

  const originalWords = getStringsFromPieces({
    pieces,
    gridSize,
    solution: true,
  });

  const {gameIsSolved, reason} = crosswordValidQ({
    grid: grid,
    trie: trie,
    exceptedWords: originalWords,
  });

  return {
    gameIsSolved: gameIsSolved,
    reason: reason,
  };
}
