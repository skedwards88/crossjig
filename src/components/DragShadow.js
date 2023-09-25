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

  return (
    <div
      className="piece shadow-piece" 
      style={{
        gridRow: top + 1, // CSS grid coordinates are 1-based
        gridColumn: left + 1,
      }}
    >
      {squares}
    </div>
  );
}
