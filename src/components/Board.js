import React from "react";
import Piece from "./Piece";
import DragShadow from "./DragShadow";
import {isAllowedWord} from "../logic/trie";

function transpose(grid) {
  return grid[0].map((_, index) => grid.map((row) => row[index]));
}

function markLitLetters(height, width, grid) {
  for (let row = 0; row < height; row++) {
    let start = undefined;
    let word = "";
    let disqualified = false;
    for (let col = 0; col < width; col++) {
      const square = grid[row][col];
      if (square.letter) {
        if (start == undefined) {
          start = col;
        }
        word += square.letter;
        if (square.count > 1) {
          disqualified = true;
        }
        if (start !== undefined && !grid[row][col + 1]?.count) {
          if (!disqualified && isAllowedWord(word)) {
            for (let lightCol = start; lightCol <= col; lightCol++) {
              grid[row][lightCol].lit = true;
            }
          }
          start = undefined;
          word = "";
          disqualified = false;
        }
      }
    }
  }
}

// Returns a grid with the number of letters at each location in the grid
// TODO - move this to logic
export function countingGrid(height, width, pieces) {
  let grid = Array(height)
    .fill(undefined)
    .map(() => Array.from({length: width}, () => ({count: 0, letter: "", lit: false})));

  for (let piece of pieces) {
    const letters = piece.letters;
    let top = piece.boardTop ?? piece.groupTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = piece.boardLeft ?? piece.groupLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        const letter = letters[rowIndex][colIndex];
        if (letter) {
          grid[top][left].count++;
          grid[top][left].letter = letter;
        }
        left++;
      }
      top++;
    }
  }

  markLitLetters(height, width, grid);
  grid = transpose(grid);
  markLitLetters(width, height, grid);
  grid = transpose(grid);
  return grid;
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
  const pieceElements = boardPieces.map((piece) => (
    <Piece
      key={piece.id}
      piece={piece}
      where="board"
      overlapGrid={overlapGrid}
      gameIsSolved={gameIsSolved}
      dispatchGameState={dispatchGameState}
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
