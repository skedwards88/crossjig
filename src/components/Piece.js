import React from "react";

function Letter({
  pieceID,
  letter,
  pieceRowIndex,
  pieceColIndex,
  overlapping,
  gameIsSolved,
  dispatchGameState,
}) {
  const onPointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const pointer = { x: event.clientX, y: event.clientY };
    dispatchGameState({
      action: "dragStart",
      pieceID,
      pointerID: event.pointerId,
      pointer,
    });
  };

  let className = "letter";
  if (gameIsSolved) {
    className += " filled";
  }
  if (overlapping) {
    className += " overlapping";
  }

  return (
    <div
      className={className}
      style={{
        gridRow: pieceRowIndex + 1, // CSS grid coordinates are 1-based
        gridColumn: pieceColIndex + 1,
      }}
      onPointerDown={onPointerDown}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      {letter}
    </div>
  );
}

function LetterBorder({ rowIndex, colIndex, border }) {
  let className = "letter-border";
  if (border.top) {
    className += " borderTop";
  }
  if (border.bottom) {
    className += " borderBottom";
  }
  if (border.left) {
    className += " borderLeft";
  }
  if (border.right) {
    className += " borderRight";
  }
  return (
    <div
      className={className}
      style={{
        gridRow: rowIndex + 1, // CSS grid coordinates are 1-based
        gridColumn: colIndex + 1,
      }}
    />
  );
}

export default function Piece({
  piece,
  where,
  overlapGrid,
  gameIsSolved,
  dispatchGameState,
}) {
  const isOnBoard = where == "board";
  const isDragging = where == "drag";
  const letters = piece.letters;
  let letterElements = [];
  let borderElements = [];
  for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
    for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
      const letter = letters[rowIndex][colIndex];
      if (letter) {
        letterElements.push(
          <Letter
            key={`${piece.id}-${rowIndex}-${colIndex}`}
            pieceID={piece.id}
            letter={letter}
            pieceRowIndex={rowIndex}
            pieceColIndex={colIndex}
            overlapping={
              isOnBoard &&
              overlapGrid[piece.boardTop + rowIndex][
                piece.boardLeft + colIndex
              ] > 1
            }
            gameIsSolved={gameIsSolved}
            dispatchGameState={dispatchGameState}
          />
        );
        borderElements.push(
          <LetterBorder
            key={`border-${piece.id}-${rowIndex}-${colIndex}`}
            rowIndex={rowIndex}
            colIndex={colIndex}
            border={{
              top: !letters[rowIndex - 1]?.[colIndex],
              bottom: !letters[rowIndex + 1]?.[colIndex],
              left: !letters[rowIndex][colIndex - 1],
              right: !letters[rowIndex][colIndex + 1],
            }}
          />
        );
      }
    }
  }

  let layoutStyle = {};
  const nrows = letters.length;
  const ncols = letters[0].length;
  if (isOnBoard) {
    layoutStyle.gridRow = `${piece.boardTop + 1} / span ${nrows}`;
    layoutStyle.gridColumn = `${piece.boardLeft + 1} / span ${ncols}`;
  } else if (isDragging) {
    layoutStyle.gridRow = `${piece.groupTop + 1} / span ${nrows}`;
    layoutStyle.gridColumn = `${piece.groupLeft + 1} / span ${ncols}`;
  }

  return (
    <div
      id={`piece-${piece.id}`}
      className="piece"
      style={{
        "--grid-rows": `${letters.length}`,
        "--grid-columns": `${letters[0].length}`,
        ...layoutStyle,
      }}
    >
      {letterElements}
      {borderElements}
    </div>
  );
}
