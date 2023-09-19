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

function PoolLetter({
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
    onDragStart: 
      isOnBoard
      ? (event) => {
        dragToken({
          event: event,
          dragArea: "board",
          pieceID: letterInfo?.pieceID,
          relativeTop: letterInfo?.relativeTop,
          relativeLeft: letterInfo?.relativeLeft,
          boardTop: gridRowIndex,
          boardLeft: gridColIndex,
        });
      }
      : letterInfo
      ? (event) => {
        dragToken({
          event: event,
          dragArea: "pool",
          pieceID: pieceID,
          relativeTop: letterInfo.pieceRowIndex,
          relativeLeft: letterInfo.pieceColIndex,
          boardTop: undefined,
          boardLeft: undefined,
        });
      }
      : ignoreEvent,
    onDragEnter: isOnBoard
      ? (event) => {
        event.preventDefault();
        handleBoardDragEnter({
          event: event,
          rowIndex: gridRowIndex,
          colIndex: gridColIndex,
        });
      }
      : ignoreEvent,
    onDragOver: ignoreEvent,
    onDrop: isOnBoard
      ? (event) => {
        event.preventDefault();
        handleBoardDrop({
          event: event,
          rowIndex: gridRowIndex,
          colIndex: gridColIndex,
        });
      }
      : ignoreEvent,
    onDragEnd: isOnBoard
      ? (event) => {
        // according to the HTML spec, the drop event fires before the dragEnd event
        event.preventDefault();
        // only call the dispatcher if ios didn't force end the drag prematurely
        // otherwise just reset the state
        if (!wasCanceledPrematurely) {
          dispatchGameState({ action: "dragEnd" });
        } else {
          setWasCanceledPrematurely(false);
        }
      }
      : (event) => {
        // according to the HTML spec, the drop event fires before the dragEnd event
        event.preventDefault();
        dispatchGameState({ action: "dragEnd" });
      },
    onPointerDown: isOnBoard
      ? () => {
        handleTouchStart(letterInfo?.pieceID);
      }
      : null,
    onPointerUp: isOnBoard ? handleTouchEnd : null,
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
      : null,
    onPointerMove: isOnBoard ? ignoreEvent : null,
    onContextMenu: isOnBoard ? ignoreEvent : null,
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

export function BoardSquare({
  rowIndex: gridRowIndex,
  colIndex: gridColIndex,
  letterInfo,
  gameIsSolved,
  dragController,
}) {
  return PoolLetter({
    isOnBoard: true,
    pieceID: letterInfo?.pieceID,
    letterInfo,
    gridRowIndex,
    gridColIndex,
    gameIsSolved,
    dragController,
  });
}

export default function Piece({
  letters,
  pieceID,
  handlePoolDragEnter,
  dragToken,
  dropOnPool,
  draggedPieceIDs,
  dispatchGameState,
}) {
  let letterElements = [];
  const isDragging = draggedPieceIDs.includes(pieceID);
  for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
    for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
      const letterStr = letters[rowIndex][colIndex];
      const letterInfo = letterStr
        ? {
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
          }
        : undefined;
      letterElements.push(
        <PoolLetter
          key={`${pieceID}-${rowIndex}-${colIndex}`}
          isOnBoard={false}
          pieceID={pieceID}
          rowIndex={rowIndex}
          colIndex={colIndex}
          letterInfo={letterInfo}
          gameIsSolved={false}
          dragController={{dragToken, dispatchGameState}}
        />
      );
    }
  }
  return (
    <div
      className="poolPiece"
      id={`poolPiece-${pieceID}`}
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
