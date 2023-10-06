import React from "react";

function DragShadowSquare({ rowIndex, colIndex, hasShadowToTop, hasShadowToLeft }) {
  let className = "shadow-square";
  if (hasShadowToTop) {
    className += " shadow-to-top";
  }
  if (hasShadowToLeft) {
    className += " shadow-to-left";
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
            hasShadowToTop={rowIndex > 0 && grid[rowIndex - 1][colIndex] > 0}
            hasShadowToLeft={colIndex > 0 && grid[rowIndex][colIndex - 1] > 0}
          />
        );
      }
    }
  }

  const styles = {
    "--numRows": grid.length,
    "--numCols": grid[0].length,
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
