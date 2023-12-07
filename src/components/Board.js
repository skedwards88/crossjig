import React from "react";
import Piece from "./Piece";
import DragShadow from "./DragShadow";
import { getGridFromPieces } from "../logic/getGridFromPieces";
import { isKnown } from "@skedwards88/word_logic";
import { trie } from "../logic/trie";
import { getWordsFromPieces } from "../logic/getWordsFromPieces";
import { transposeGrid } from "@skedwards88/word_logic";

// Returns a grid with the number of letters at each location in the grid
export function countingGrid(height, width, pieces) {
  let grid = Array(height)
    .fill(undefined)
    .map(() => Array(width).fill(0));

  for (let piece of pieces) {
    const letters = piece.letters;
    let top = piece.boardTop ?? piece.groupTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = piece.boardLeft ?? piece.groupLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        if (letters[rowIndex][colIndex]) {
          grid[top][left]++;
        }
        left++;
      }
      top++;
    }
  }
  return grid;
}

function getHorizontalValidityGrid({grid, originalWords}) {
  // return a 2D array of bools indicating whether
  // the position corresponds to a letter on the board
  // that is part of a valid horizontal word
  const height = grid.length;
  const width = grid[0].length;

  const horizontalValidityGrid = Array(height)
    .fill(undefined)
    .map(() => Array(width).fill(false));

  for (const [rowIndex, row] of grid.entries()) {
    let word = "";
    let indexes = [];
    for (const [columnIndex, letter] of row.entries()) {
      if (letter != "") {
        word += letter;
        indexes.push(columnIndex);
      } else {
        if (word.length > 1) {
          // If the word is one of the original words, always consider it valid (in case we updated the dictionary in the interim).
          // Otherwise, check whether it is a word in the trie.
          let isWord = originalWords.includes(word);
          if (!isWord) {
            ({ isWord } = isKnown(word, trie));
          }
          if (isWord) {
            indexes.forEach(
              (index) => (horizontalValidityGrid[rowIndex][index] = true)
            );
          }
        }
        word = "";
        indexes = [];
      }
    }
    // Also end the word if we reach the end of the row
    if (word.length > 1) {
      // If the word is one of the original words, always consider it valid (in case we updated the dictionary in the interim).
      // Otherwise, check whether it is a word in the trie.
      let isWord = originalWords.includes(word);
      if (!isWord) {
        ({ isWord } = isKnown(word, trie));
      }
      if (isWord) {
        indexes.forEach(
          (index) => (horizontalValidityGrid[rowIndex][index] = true)
        );
      }
    }
  }

  return horizontalValidityGrid;
}

function getWordValidityGrids({ pieces, gridSize }) {
  const originalWords = getWordsFromPieces({
    pieces,
    gridSize,
    solution: true,
  });

  const grid = getGridFromPieces({ pieces, gridSize, solution: false });

  const horizontalValidityGrid = getHorizontalValidityGrid({grid, originalWords})

  const transposedGrid = transposeGrid(grid);
  const horizontalTransposedValidityGrid = getHorizontalValidityGrid({grid: transposedGrid, originalWords});
  const verticalValidityGrid = transposeGrid(horizontalTransposedValidityGrid);

  return [horizontalValidityGrid, verticalValidityGrid];
}

export default function Board({
  pieces,
  gridSize,
  dragPieceIDs,
  dragDestination,
  gameIsSolved,
  dispatchGameState,
}) {
  const boardPieces = pieces.filter(
    (piece) => piece.boardTop >= 0 && piece.boardLeft >= 0
  );

  const overlapGrid = countingGrid(gridSize, gridSize, boardPieces);
  const [horizontalValidityGrid, verticalValidityGrid] = getWordValidityGrids({ pieces, gridSize });
  const pieceElements = boardPieces.map((piece) => (
    <Piece
      key={piece.id}
      piece={piece}
      where="board"
      overlapGrid={overlapGrid}
      gameIsSolved={gameIsSolved}
      dispatchGameState={dispatchGameState}
      horizontalValidityGrid={horizontalValidityGrid}
      verticalValidityGrid={verticalValidityGrid}
    />
  ));

  // Any pieces that are currently being dragged over the board will render on the board as a single drag shadow
  let dragShadow;
  if (dragDestination?.where === "board") {
    const draggedPieces = pieces.filter((piece) =>
      dragPieceIDs.includes(piece.id)
    );
    const grid = countingGrid(gridSize, gridSize, draggedPieces);
    dragShadow = (
      <DragShadow
        grid={grid}
        top={dragDestination.top}
        left={dragDestination.left}
      />
    );
  }

  return (
    <div
      id="board"
      onPointerDown={(event) => {
        event.preventDefault();
        dispatchGameState({
          action: "shiftStart",
          pointerID: event.pointerId,
          pointer: { x: event.clientX, y: event.clientY },
        });
      }}
    >
      {pieceElements}
      {dragShadow}
    </div>
  );
}

export function dragDestinationOnBoard(gameState, pointer) {
  const boardRect = document.getElementById("board").getBoundingClientRect();
  if (
    gameState.dragState.destination.where === "board" ||
    (boardRect.left <= pointer.x &&
      pointer.x <= boardRect.right &&
      boardRect.top <= pointer.y &&
      pointer.y <= boardRect.bottom)
  ) {
    const draggedPieceIDs = gameState.dragState.pieceIDs;
    const draggedPieces = gameState.pieces.filter((piece) =>
      draggedPieceIDs.includes(piece.id)
    );

    const groupHeight = Math.max(
      ...draggedPieces.map((piece) => piece.groupTop + piece.letters.length)
    );
    const groupWidth = Math.max(
      ...draggedPieces.map((piece) => piece.groupLeft + piece.letters[0].length)
    );
    const maxTop = gameState.gridSize - groupHeight;
    const maxLeft = gameState.gridSize - groupWidth;

    // Subtract 1 before dividing because the board is n squares wide, but has n+1 1px borders.
    // (It's admittedly silly to care about this, since the impact is only 1/n of a pixel!)
    const squareWidth = (boardRect.width - 1) / gameState.gridSize;
    const squareHeight = (boardRect.height - 1) / gameState.gridSize;
    const pointerOffset = gameState.dragState.pointerOffset;
    const unclampedLeft = Math.round(
      (pointer.x - pointerOffset.x - boardRect.left) / squareWidth
    );
    const unclampedTop = Math.round(
      (pointer.y - pointerOffset.y - boardRect.top) / squareHeight
    );
    const left = Math.max(0, Math.min(maxLeft, unclampedLeft));
    const top = Math.max(0, Math.min(maxTop, unclampedTop));

    return { where: "board", top, left };
  }

  return undefined;
}
