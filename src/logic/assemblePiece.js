import {getPieceDimension} from "./getPieceDimension";

export function assemblePiece({pieceData, rowIndex, colIndex}) {
  const {numCols, numRows, minTop, minLeft} = getPieceDimension(pieceData);
  const topAdjust = Math.abs(Math.min(0, minTop));
  const leftAdjust = Math.abs(Math.min(0, minLeft));

  let grid = Array.from({length: numRows}, () =>
    Array.from({length: numCols}, () => ""),
  );
  for (let pieceIndex = 0; pieceIndex < pieceData.length; pieceIndex++) {
    grid[pieceData[pieceIndex].top + topAdjust][
      pieceData[pieceIndex].left + leftAdjust
    ] = pieceData[pieceIndex].letter;
  }
  return {
    letters: grid,
    solutionTop: rowIndex - topAdjust,
    solutionLeft: colIndex - leftAdjust,
  };
}
