export function getPieceDimension(pieceData) {
  const maxTop = pieceData
    .map((data) => data.top)
    .reduce(
      (currentMax, comparison) =>
        currentMax > comparison ? currentMax : comparison,
      0
    );
  const minTop = pieceData
    .map((data) => data.top)
    .reduce(
      (currentMin, comparison) =>
        currentMin < comparison ? currentMin : comparison,
      0
    );
  const numRows = maxTop - minTop + 1;

  const maxLeft = pieceData
    .map((data) => data.left)
    .reduce(
      (currentMax, comparison) =>
        currentMax > comparison ? currentMax : comparison,
      0
    );
  const minLeft = pieceData
    .map((data) => data.left)
    .reduce(
      (currentMin, comparison) =>
        currentMin < comparison ? currentMin : comparison,
      0
    );
  const numCols = maxLeft - minLeft + 1;

  return {
    numCols: numCols,
    numRows: numRows,
    maxTop: maxTop,
    minTop: minTop,
    maxLeft: maxLeft,
    minLeft: minLeft,
  };
}
