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

export function NewPiece({
  piece,
  isOnBoard,
  isInPool,
  overlapGrid,
  isDragging,
  gameIsSolved,
  dragController,
}) {
  const letters = piece.letters;
  let letterElements = [];
  let letterDragController = isOnBoard
    ? dragController
    : {
      dragToken: dragController.dragToken,
      dispatchGameState: dragController.dispatchGameState
    };
  for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
    for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
      const letter = letters[rowIndex][colIndex];
      if (letter) {
        letterElements.push(
          <Letter
            key={`${piece.id}-${rowIndex}-${colIndex}`}
            isOnBoard={isOnBoard}
            pieceID={piece.id}
            letterInfo={{
              letter,
              pieceID: piece.id,
              pieceRowIndex: rowIndex,
              pieceColIndex: colIndex,
              border: {
                top: !letters[rowIndex - 1]?.[colIndex],
                bottom: !letters[rowIndex + 1]?.[colIndex],
                left: !letters[rowIndex][colIndex - 1],
                right: !letters[rowIndex][colIndex + 1],
              },
              overlapping: isOnBoard && overlapGrid[piece.boardTop + rowIndex][piece.boardLeft + colIndex] > 1,
              isDragging,
            }}
            gridRowIndex={isOnBoard ? top : undefined}
            gridColIndex={isOnBoard ? left : undefined}
            gameIsSolved={gameIsSolved}
            dragController={letterDragController}
          />
        );
      }
    }
  }

  let onDragEnter, onDragEnd, onDragOver, onDrop;
  let className = "poolPiece";
  let layoutStyle = {};
  if (isOnBoard) {
    className = "boardPiece";
    layoutStyle.gridRow = piece.boardTop + 1,
    layoutStyle.gridColumn = piece.boardLeft + 1,
  } else if (isInPool) {
    onDragEnter = (event) => {
      handlePoolDragEnter({
        event: event,
        targetPieceID: pieceID,
      });
    };
    onDragEnd = ignoreEvent;
    onDragOver = ignoreEvent;
    onDrop = (event) => {
      event.preventDefault();
      dropOnPool({ event: event, targetPieceID: pieceID });
    };
  }

  return (
    <div
      id={`piece-${piece.id}`}
      className={className}
      style={{
        "--numRows": `${letters.length}`,
        "--numCols": `${letters[0].length}`,
        ...layoutStyle
      }}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {letterElements}
    </div>
  );
}

export function BoardPiece({
  overlapGrid,
  piece,
  isDragging,
  gameIsSolved,
  dragController,
}) {
  return NewPiece({
    piece,
    isOnBoard: true,
    isInPool: false,
    overlapGrid,
    isDragging,
    gameIsSolved,
    dragController,
  });
}


export default function Piece({
  piece,
  isDragging,
  dragController,
}) {
  return NewPiece({
    piece,
    isOnBoard: false,
    isInPool: true,
    isDragging,
    gameIsSolved: false,
    dragController,
  });
}
