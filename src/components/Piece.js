import React from "react";
import { polyfill } from "mobile-drag-drop";

polyfill({
  dragImageCenterOnTouch: true,
  // force apply is required to skip the drag delay on ipad
  forceApply: true,
});

function ignoreEvent(event) {
  event.preventDefault();
}

export function Letter({
  isOnBoard,
  pieceID,
  letterInfo,
  gridRowIndex,
  gridColIndex,
  gameIsSolved,
  dragController: {
    handleBoardDragEnter,
    handleBoardDrop,
    handleTouchStart,
    handleTouchEnd,
    wasCanceledPrematurely,
    setWasCanceledPrematurely,
    dragToken,
    dispatchGameState,
  },
}) {
  const eventHandlers = {
    onDragStart: (event) => {
      if (isOnBoard || letterInfo) {
        dragToken({
          event: event,
          dragArea: isOnBoard ? "board" : "pool",
          pieceID: pieceID,
          relativeTop: isOnBoard ? letterInfo?.relativeTop : letterInfo.pieceRowIndex,
          relativeLeft: isOnBoard ? letterInfo?.relativeLeft : letterInfo.pieceColIndex,
          boardTop: isOnBoard ? gridRowIndex : undefined,
          boardLeft: isOnBoard ? gridColIndex : undefined,
        });
      } else {
        event.preventDefault();
      }
    },
    onDragEnter: (event) => {
      event.preventDefault();
      if (isOnBoard) {
        handleBoardDragEnter({
          event: event,
          rowIndex: gridRowIndex,
          colIndex: gridColIndex,
        });
      }
    },
    onDragOver: ignoreEvent,
    onDrop: (event) => {
      event.preventDefault();
      if (isOnBoard) {
        handleBoardDrop({
          event: event,
          rowIndex: gridRowIndex,
          colIndex: gridColIndex,
        });
      }
    },
    onDragEnd: (event) => {
      // according to the HTML spec, the drop event fires before the dragEnd event
      event.preventDefault();
      if (isOnBoard && wasCanceledPrematurely) {
        // only call the dispatcher if ios didn't force end the drag prematurely
        // otherwise just reset the state
        setWasCanceledPrematurely(false);
      } else {
        dispatchGameState({ action: "dragEnd" });
      }
    },
    onPointerDown: isOnBoard
      ? () => {
        handleTouchStart(letterInfo?.pieceID);
      }
      : undefined,
    onPointerUp: isOnBoard ? handleTouchEnd : undefined,
    onPointerCancel: isOnBoard
      ? (event) => {
        // ios cancels the pointer event which then cancels the drag event,
        // so we need to catch that and stop the dispatcher from being called in the drag end handler.
        event.stopPropagation();
        event.preventDefault();
        // stopPropagation and preventDefault don't actually stop this
        // (but I left them in place in hopes that ios will follow standards in the future),
        // so track whether the drag was canceled prematurely via the state
        setWasCanceledPrematurely(true);
      }
      : undefined,
    onPointerMove: isOnBoard ? ignoreEvent : undefined,
    onContextMenu: isOnBoard ? ignoreEvent : undefined,
  };

  let className = isOnBoard ? "boardLetter" : "poolLetter";
  if (letterInfo) {
    if (gameIsSolved) {
      className += " filled";
    }
    if (letterInfo.isDragging) {
      className += " dragging";
    }
    if (letterInfo.border.top) {
      className += " borderTop";
    }
    if (letterInfo.border.bottom) {
      className += " borderBottom";
    }
    if (letterInfo.border.left) {
      className += " borderLeft";
    }
    if (letterInfo.border.right) {
      className += " borderRight";
    }
    if (letterInfo.overlapping) {
      className += " overlapping";
    }
  }

  return (
    <div
      className={className}
      style={{
        gridRow: (letterInfo ? letterInfo.pieceRowIndex : gridRowIndex) + 1,
        gridColumn: (letterInfo ? letterInfo.pieceColIndex : gridColIndex) + 1,
      }}
      draggable="true"
      onDragStart={eventHandlers.onDragStart}
      onDragEnter={eventHandlers.onDragEnter}
      onDragOver={eventHandlers.onDragOver}
      onDrop={eventHandlers.onDrop}
      onDragEnd={eventHandlers.onDragEnd}
      onPointerDown={eventHandlers.onPointerDown}
      onPointerUp={eventHandlers.onPointerUp}
      onPointerCancel={eventHandlers.onPointerCancel}
      onPointerMove={eventHandlers.onPointerMove}
      onContextMenu={eventHandlers.onContextMenu}
    >
      {letterInfo?.letter}
    </div>
  );
}

export function BoardPiece({
  grid,
  piece,
  isDragging,
  gameIsSolved,
  dragController,
}) {
  const letterElements = [];
  const letters = piece.letters;
  let top = piece.boardTop;
  for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
    let left = piece.boardLeft;
    for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
      let letter = letters[rowIndex][colIndex];
      if (letter) {
        const letterInfo = {
          letter,
          relativeTop: rowIndex,
          relativeLeft: colIndex,
          pieceID: piece.id,
          pieceRowIndex: rowIndex,
          pieceColIndex: colIndex,
          border: {
            top: !letters[rowIndex - 1]?.[colIndex],
            bottom: !letters[rowIndex + 1]?.[colIndex],
            left: !letters[rowIndex][colIndex - 1],
            right: !letters[rowIndex][colIndex + 1],
          },
          overlapping: grid[top][left] > 1,
          isDragging,
        };
        letterElements.push(
          <Letter
            key={`${piece.id}-${rowIndex}-${colIndex}`}
            isOnBoard={true}
            pieceID={piece.id}
            letterInfo={letterInfo}
            gridRowIndex={top}
            gridColIndex={left}
            gameIsSolved={gameIsSolved}
            dragController={dragController}
          />
        );
      }
      left += 1;
    }
    top += 1;
  }

  return (
    <div
      className="boardPiece"
      style={{
        "--numRows": `${letters.length}`,
        "--numCols": `${letters[0].length}`,
        gridRow: piece.boardTop + 1,
        gridColumn: piece.boardLeft + 1,
      }}
    >
      {letterElements}
    </div>
  );
}

export default function Piece({
  piece,
  isDragging,
  dragController: {
    handlePoolDragEnter,
    dragToken,
    dropOnPool,
    dispatchGameState,
  },
}) {
  const letters = piece.letters;
  let letterElements = [];
  for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
    for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
      const letterStr = letters[rowIndex][colIndex];
      if (letterStr) {
        letterElements.push(
          <Letter
            key={`${piece.id}-${rowIndex}-${colIndex}`}
            isOnBoard={false}
            pieceID={piece.id}
            letterInfo={{
              letter: letterStr,
              pieceRowIndex: rowIndex,
              pieceColIndex: colIndex,
              border: {
                top: !letters[rowIndex - 1]?.[colIndex],
                bottom: !letters[rowIndex + 1]?.[colIndex],
                left: !letters[rowIndex][colIndex - 1],
                right: !letters[rowIndex][colIndex + 1],
              },
              overlapping: false,
              isDragging,
            }}
            gameIsSolved={false}
            dragController={{dragToken, dispatchGameState}}
          />
        );
      }
    }
  }
  return (
    <div
      className="poolPiece"
      id={`poolPiece-${piece.id}`}
      style={{
        "--numRows": `${letters.length}`,
        "--numCols": `${letters[0].length}`,
      }}
      onDragEnter={(event) => {
        handlePoolDragEnter({
          event: event,
          targetPieceID: pieceID,
        });
      }}
      onDragEnd={ignoreEvent}
      onDragOver={ignoreEvent}
      onDrop={(event) => {
        event.preventDefault();
        dropOnPool({ event: event, targetPieceID: pieceID });
      }}
    >
      {letterElements}
    </div>
  );
}
