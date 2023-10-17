import React from "react";

function DragShadowSquare({ rowIndex, colIndex }) {
  return (
    <div
      className="shadow-square"
      style={{
        gridRow: rowIndex + 1, // CSS grid coordinates are 1-based
        gridColumn: colIndex + 1,
      }}
    />
  );
}

export default function DragShadow({ grid, top, left }) {
  let squares = [];
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (let colIndex = 0; colIndex < grid[0].length; colIndex++) {
      if (grid[rowIndex][colIndex] > 0) {
        squares.push(
          <DragShadowSquare
            key={`${rowIndex}-${colIndex}`}
            rowIndex={rowIndex}
            colIndex={colIndex}
          />
        );
      }
    }
  }

  const styles = {
    "--grid-rows": grid.length,
    "--grid-columns": grid[0].length,
  };
  // For the drag shadow on the board, need to specify the position of shadow on the board
  if (top !== undefined) {
    styles.gridRow = top + 1; // CSS grid coordinates are 1-based
    styles.gridColumn = left + 1;
  }

  return (
    <div className="piece shadow-piece" style={styles}>
      {squares}
    </div>
  );
}
