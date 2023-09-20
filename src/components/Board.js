import React from "react";
import { polyfill } from "mobile-drag-drop";
import { Letter, BoardPiece } from "./Piece";

polyfill({
  dragImageCenterOnTouch: true,
});

function countingGrid(gridSize, boardPieces) {
  let grid = Array(gridSize)
    .fill(undefined)
    .map(() => Array(gridSize).fill(0));

  for (let index = 0; index < boardPieces.length; index++) {
    const letters = boardPieces[index].letters;
    let top = boardPieces[index].boardTop;
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = boardPieces[index].boardLeft;
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        let letter = letters[rowIndex][colIndex];
        if (letter) {
          grid[top][left]++;
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

  const grid = countingGrid(gridSize, boardPieces);
  let dragController = {
    handleBoardDragEnter,
    handleBoardDrop,
    dragToken,
    wasCanceledPrematurely,
    setWasCanceledPrematurely,
    handleTouchStart,
    handleTouchEnd,
  };
  let pieceElements = boardPieces.map((piece) => 
    <BoardPiece
      key={piece.id}
      grid={grid}
      piece={piece}
      isDragging={draggedPieceIDs.includes(piece.id)}
      gameIsSolved={gameIsSolved}
      dragController={dragController}
      />
  );
  let gridDropTargets = [];
  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    for (let colIndex = 0; colIndex < gridSize; colIndex++) {
      if (grid[rowIndex][colIndex] == 0) {
        gridDropTargets.push(
          <Letter
            isOnBoard={true}
            pieceID={undefined}
            letterInfo={null}
            gridRowIndex={rowIndex}
            gridColIndex={colIndex}
            gameIsSolved={gameIsSolved}
            dragController={dragController}
          />
        );
      }
    }
  }

  // The drop targets must go on top of the pieces because drop events are not
  // delivered to them when they're underneath a transparent part of a Piece.
  return (
    <div id="board">
      {pieceElements}
      {gridDropTargets}
    </div>
  );
}
