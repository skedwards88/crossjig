import React from "react";
import { polyfill } from "mobile-drag-drop";
import { BoardSquare } from "./Piece";

polyfill({
  dragImageCenterOnTouch: true,
});

function generateGridFromBoardPieces(boardPieces, gridSize, draggedPieceIDs) {
  let grid = Array(gridSize)
    .fill(undefined)
    .map(() => Array(gridSize).fill(undefined));

  for (let index = 0; index < boardPieces.length; index++) {
    const letters = boardPieces[index].letters;
    const pieceID = boardPieces[index].id;
    let top = boardPieces[index].boardTop;
    let isDragging = draggedPieceIDs.includes(pieceID);
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = boardPieces[index].boardLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        let letter = letters[rowIndex][colIndex];
        if (letter) {
          const overlapping = grid[top][left] !== undefined;
          grid[top][left] = {
            letter,
            relativeTop: rowIndex,
            relativeLeft: colIndex,
            pieceID,
            border: {
              top: !letters[rowIndex - 1]?.[colIndex],
              bottom: !letters[rowIndex + 1]?.[colIndex],
              left: !letters[rowIndex][colIndex - 1],
              right: !letters[rowIndex][colIndex + 1],
            },
            overlapping,
            isDragging,
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
  gameIsSolved,
  dispatchGameState,
  draggedPieceIDs,
}) {
  const timerID = React.useRef();
  function handleTouchStart(pieceID) {
    timerID.current = setTimeout(() => {
      // If the press exceeds the timeout, it is long
      // At this point, initiate the multi-select
      if (pieceID != undefined) {
        dispatchGameState({ action: "multiSelect", pieceID });
      }
    }, 500);
  }

  // ios cancels the drag event after a certain amount of time
  // even with event.preventDefault() and touch-action:none and modifying the viewport meta tag
  // so track when that happens so I can skip calling the dispatcher when it does
  // (I don't like how hacky this is)
  const [wasCanceledPrematurely, setWasCanceledPrematurely] =
    React.useState(false);

  function handleTouchEnd(event) {
    event.preventDefault();

    if (timerID.current) {
      clearTimeout(timerID.current);
    }

    dispatchGameState({ action: "endMultiSelect" });
  }

  const boardPieces = pieces.filter(
    (piece) => piece.boardTop >= 0 && piece.boardLeft >= 0
  );

  const grid = generateGridFromBoardPieces(
    boardPieces,
    gridSize,
    draggedPieceIDs
  );

  let boardElements = [];
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
      const letterInfo = grid[rowIndex][colIndex];

      boardElements.push(
        <BoardSquare
          key={`${rowIndex}-${colIndex}`}
          rowIndex={rowIndex}
          colIndex={colIndex}
          letterInfo={letterInfo}
          gameIsSolved={gameIsSolved}
          handleBoardDragEnter={handleBoardDragEnter}
          handleBoardDrop={handleBoardDrop}
          wasCanceledPrematurely={wasCanceledPrematurely}
          setWasCanceledPrematurely={setWasCanceledPrematurely}
          handleTouchStart={handleTouchStart}
          handleTouchEnd={handleTouchEnd}
          dragToken={dragToken}
        />
      );
    }
  }

  return <div id="board">{boardElements}</div>;
}
