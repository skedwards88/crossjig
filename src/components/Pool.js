import React from "react";
import { polyfill } from "mobile-drag-drop";

polyfill({
  dragImageCenterOnTouch: true,
});

function Letter({ pieceID, rowIndex, colIndex, letters, dragToken }) {
  let className = "poolLetter";
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

  return (
    <div
      id={`poolLetter-${pieceID}`}
      className={className}
      draggable="true"
      onDragStart={(event) => {
        dragToken({
          event: event,
          pieceID: pieceID,
          dragArea: "pool",
          relativeTop: rowIndex,
          relativeLeft: colIndex,
        });
      }}
      onDragEnd={(event) => {
        event.preventDefault();
      }}
      onDragEnter={(event) => {
        event.preventDefault();
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
      }}
    >
      {letters[rowIndex][colIndex]}
    </div>
  );
}

function Piece({
  letters,
  pieceID,
  handlePoolDragEnter,
  dragToken,
  dropOnPool,
}) {
  let letterElements = [];
  for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
    for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
      letterElements.push(
        <Letter
          pieceID={pieceID}
          rowIndex={rowIndex}
          colIndex={colIndex}
          letters={letters}
          key={`${pieceID}-${rowIndex}-${colIndex}`}
          dragToken={dragToken}
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

export default function Pool({
  pieces,
  dropOnPool,
  handlePoolDragEnter,
  dragToken,
}) {
  const poolPieces = pieces.filter((piece) => piece.poolIndex >= 0);
  poolPieces.sort((a, b) => a.poolIndex - b.poolIndex);

  const pieceElements = poolPieces.map((piece) => (
    <Piece
      letters={piece.letters}
      pieceID={piece.id}
      handlePoolDragEnter={handlePoolDragEnter}
      key={piece.id}
      dragToken={dragToken}
      dropOnPool={dropOnPool}
    ></Piece>
  ));

  return (
    <div
      id="pool"
      onDrop={(event) => {
        event.preventDefault();
        dropOnPool({ event: event });
      }}
      onDragEnd={(event) => {
        event.preventDefault();
      }}
      onDragEnter={(event) => {
        handlePoolDragEnter({
          event: event,
        });
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
    >
      {pieceElements}
    </div>
  );
}
