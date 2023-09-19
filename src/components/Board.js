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

  const grid = generateGridFromBoardPieces(boardPieces, gridSize);

  let boardElements = [];
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
      const letterInfo = grid[rowIndex][colIndex];
      const isLetter = Boolean(letterInfo?.letter);
      const isDragging = draggedPieceIDs.includes(
        letterInfo?.pieceID
      );
      const className = isLetter
        ? `boardLetter ${
            gameIsSolved ? " filled" : ""
          }${
            isDragging ? " dragging" : ""
          }${
            letterInfo.borderTop ? " borderTop" : ""
          }${
            letterInfo.borderBottom ? " borderBottom" : ""
          }${
            letterInfo.borderLeft ? " borderLeft" : ""
          }${
            letterInfo.borderRight ? " borderRight" : ""
          }${
            letterInfo.overlapping ? " overlapping" : ""
          }`
        : "boardLetter";

      let eventHandlers = {
        onDrop: (event) => {
          event.preventDefault();
          handleBoardDrop({
            event: event,
            rowIndex: rowIndex,
            colIndex: colIndex,
          });
        },
        onDragEnd: (event) => {
          // according to the HTML spec, the drop event fires before the dragEnd event
          event.preventDefault();
          // only call the dispatcher if ios didn't force end the drag prematurely
          // otherwise just reset the state
          if (!wasCanceledPrematurely) {
            dispatchGameState({ action: "dragEnd" });
          } else {
            setWasCanceledPrematurely(false);
          }
        },
        onDragOver: (event) => {
          event.preventDefault();
        },
        onDragEnter: (event) => {
          event.preventDefault();
          handleBoardDragEnter({
            event: event,
            rowIndex: rowIndex,
            colIndex: colIndex,
          });
        },
        onDragStart: (event) => {
          dragToken({
            event: event,
            dragArea: "board",
            pieceID: letterInfo?.pieceID,
            relativeTop: letterInfo?.relativeTop,
            relativeLeft: letterInfo?.relativeLeft,
            boardTop: rowIndex,
            boardLeft: colIndex,
          });
        },
        onPointerDown: () => {
          handleTouchStart(letterInfo?.pieceID);
        },
        onPointerUp: handleTouchEnd,
        onPointerCancel: (event) => {
          // ios cancels the pointer event which then cancels the drag event,
          // so we need to catch that and stop the dispatcher from being called in the drag end handler.
          event.stopPropagation();
          event.preventDefault();
          // stopPropagation and preventDefault don't actually stop this
          // (but I left them in place in hopes that ios will follow standards in the future),
          // so track whether the drag was canceled prematurely via the state
          setWasCanceledPrematurely(true);
        },
        onPointerMove: (event) => {
          event.preventDefault();
        },
        onContextMenu: (event) => {
          event.preventDefault();
        },
      };

      const element = (
        <div
          className={className}
          draggable
          key={`${rowIndex}-${colIndex}`}
          onDragEnter={eventHandlers.onDragEnter}
          onDragOver={eventHandlers.onDragOver}
          onDrop={eventHandlers.onDrop}
          onDragStart={eventHandlers.onDragStart}
          onPointerDown={eventHandlers.onPointerDown}
          onPointerUp={eventHandlers.onPointerUp}
          onPointerCancel={eventHandlers.onPointerCancel}
          onPointerMove={eventHandlers.onPointerMove}
          onContextMenu={eventHandlers.onContextMenu}
        >
          {letterInfo?.letter}
        </div>
      );
      boardElements.push(element);
    }
  }

  return <div id="board">{boardElements}</div>;
}
