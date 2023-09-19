import React from "react";
import { polyfill } from "mobile-drag-drop";

polyfill({
  dragImageCenterOnTouch: true,
  // force apply is required to skip the drag delay on ipad
  forceApply: true,
});
    
function Letter({
  pieceID,
  rowIndex,
  colIndex,
  letters,
  dragToken,
  isDragging,
  dispatchGameState,
}) {
  let className = "poolLetter";
  if (isDragging) {
    className = `${className} dragging`;
  }
  if (letters[rowIndex][colIndex]) {
    if (!letters[rowIndex - 1]?.[colIndex]) {
      className = `${className} borderTop`;
    }
    if (!letters[rowIndex + 1]?.[colIndex]) {
      className = `${className} borderBottom`;
    }
    if (!letters[rowIndex][colIndex - 1]) {
      className = `${className} borderLeft`;
    }
    if (!letters[rowIndex][colIndex + 1]) {
      className = `${className} borderRight`;
    }
  }

  const eventHandlers = {
    onDragStart: (event) => {
      dragToken({
        event: event,
        pieceID: pieceID,
        dragArea: "pool",
        relativeTop: rowIndex,
        relativeLeft: colIndex,
      });
    },
    onDragEnd: (event) => {
      // according to the HTML spec, the drop event fires before the dragEnd event
      event.preventDefault();
      dispatchGameState({ action: "dragEnd" });
    },
    onDragEnter: (event) => {
      event.preventDefault();
    },
    onDragOver: (event) => {
      event.preventDefault();
    },
    onDrop: (event) => {
      event.preventDefault();
    },
  };

  return (
    <div
      id={`poolLetter-${pieceID}`}
      className={className}
      draggable="true"
      onDragStart={eventHandlers.onDragStart}
      onDragEnd={eventHandlers.onDragEnd}
      onDragEnter={eventHandlers.onDragEnter}
      onDragOver={eventHandlers.onDragOver}
      onDrop={eventHandlers.onDrop}
    >
      {letters[rowIndex][colIndex]}
    </div>
  );
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
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        const isDragging = draggedPieceIDs.includes(pieceID);
        letterElements.push(
          <Letter
            pieceID={pieceID}
            rowIndex={rowIndex}
            colIndex={colIndex}
            letters={letters}
            key={`${pieceID}-${rowIndex}-${colIndex}`}
            dragToken={dragToken}
            isDragging={isDragging}
            dispatchGameState={dispatchGameState}
          ></Letter>
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
        onDragEnd={(event) => {
          event.preventDefault();
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          dropOnPool({ event: event, targetPieceID: pieceID });
        }}
      >
        {letterElements}
      </div>
    );
  }
  