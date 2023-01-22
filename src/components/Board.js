import React from "react";
import { polyfill } from "mobile-drag-drop";

polyfill({
  dragImageCenterOnTouch: true,
});

function generateGridFromBoardPieces(boardPieces, gridSize) {
  let grid = JSON.parse(
    JSON.stringify(Array(gridSize).fill(Array(gridSize).fill("")))
  );

  for (let index = 0; index < boardPieces.length; index++) {
    const letters = boardPieces[index].letters;
    const id = boardPieces[index].id;
    let top = boardPieces[index].boardTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = boardPieces[index].boardLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        if (letters[rowIndex][colIndex]) {
          const overlapping = Boolean(grid[top][left].letter);
          grid[top][left] = {
            letter: letters[rowIndex][colIndex],
            relativeTop: rowIndex,
            relativeLeft: colIndex,
            pieceID: id,
            borderTop: !letters[rowIndex - 1]?.[colIndex],
            borderBottom: !letters[rowIndex + 1]?.[colIndex],
            borderLeft: !letters[rowIndex][colIndex - 1],
            borderRight: !letters[rowIndex][colIndex + 1],
            overlapping: overlapping,
          };
        }
        left += 1;
      }
      top += 1;
    }
  }
  return grid;
}

export default function Board({
  pieces,
  handleBoardDragEnter,
  handleBoardDrop,
  gridSize,
  dragToken,
}) {
  const boardPieces = pieces.filter(
    (piece) => piece.boardTop >= 0 && piece.boardLeft >= 0
  );

  const grid = generateGridFromBoardPieces(boardPieces, gridSize);

  let boardElements = [];
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
      const isLetter = Boolean(grid[rowIndex][colIndex]?.letter);
      const element = (
        <div
          className={
            isLetter
              ? `boardLetter${
                  grid[rowIndex][colIndex].borderTop ? " borderTop" : ""
                }${
                  grid[rowIndex][colIndex].borderBottom ? " borderBottom" : ""
                }${grid[rowIndex][colIndex].borderLeft ? " borderLeft" : ""}${
                  grid[rowIndex][colIndex].borderRight ? " borderRight" : ""
                }${grid[rowIndex][colIndex].overlapping ? " overlapping" : ""}`
              : "boardLetter"
          }
          draggable
          key={`${rowIndex}-${colIndex}`}
          onDrop={(event) => {
            event.preventDefault();
            handleBoardDrop({
              event: event,
              rowIndex: rowIndex,
              colIndex: colIndex,
            });
          }}
          onDragEnd={(event) => {
            event.preventDefault();
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            handleBoardDragEnter({
              event: event,
              rowIndex: rowIndex,
              colIndex: colIndex,
            });
          }}
          onDragStart={(event) => {
            dragToken({
              event: event,
              dragArea: "board",
              pieceID: grid[rowIndex][colIndex]?.pieceID,
              relativeTop: grid[rowIndex][colIndex]?.relativeTop,
              relativeLeft: grid[rowIndex][colIndex]?.relativeLeft,
              boardTop: rowIndex,
              boardLeft: colIndex,
            });
          }}
        >
          {grid[rowIndex][colIndex]?.letter}
        </div>
      );
      boardElements.push(element);
    }
  }

  return <div id="board">{boardElements}</div>;
}
