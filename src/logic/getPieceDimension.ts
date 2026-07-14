export function getPieceDimension(
  pieceData: {
    // top and left are relative. One letter will have top/left as 0/0. The rest will be relative to that position, with positive numbers indicating to down/right and negative numbers indicating to up/left
    top: number; // the vertical location of the letter in the piece
    left: number; // the horizontal location of the letter in the piece
  }[],
): {
  numCols: number; // width of the piece
  numRows: number; // height of the piece
  maxTop: number; // the highest "top" value of the incoming pieceData
  minTop: number; // the lowest "top" value of the incoming pieceData
  maxLeft: number; // the highest "left" value of the incoming pieceData
  minLeft: number; // the lowest "left" value of the incoming pieceData
} {
  const maxTop = pieceData
    .map((data) => data.top)
    .reduce(
      (currentMax, comparison) =>
        currentMax > comparison ? currentMax : comparison,
      0,
    );
  const minTop = pieceData
    .map((data) => data.top)
    .reduce(
      (currentMin, comparison) =>
        currentMin < comparison ? currentMin : comparison,
      0,
    );
  const numRows = maxTop - minTop + 1;

  const maxLeft = pieceData
    .map((data) => data.left)
    .reduce(
      (currentMax, comparison) =>
        currentMax > comparison ? currentMax : comparison,
      0,
    );
  const minLeft = pieceData
    .map((data) => data.left)
    .reduce(
      (currentMin, comparison) =>
        currentMin < comparison ? currentMin : comparison,
      0,
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
