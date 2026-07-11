import type {LetterOrEmpty, PieceWithoutLocation} from "../Types";
import {getPieceDimension} from "./getPieceDimension";

export function assemblePiece({
  pieceData,
  id,
  rowIndex,
  colIndex,
}: {
  pieceData: {
    letter: LetterOrEmpty;
    // top and left are relative. One letter will have top/left as 0/0. The rest will be relative to that position, with positive numbers indicating to down/right and negative numbers indicating to up/left
    top: number; // the vertical location of the letter in the piece
    left: number; // the horizontal location of the letter in the piece
  }[];
  id: number;
  rowIndex: number; // the vertical location of the piece in the board, relative to how top/left for each letter in pieceData are defined
  colIndex: number; // the horizontal location of the piece in the board, relative to how top/left for each letter in pieceData are defined
}): PieceWithoutLocation {
  const {numCols, numRows, minTop, minLeft} = getPieceDimension(pieceData);
  const topAdjust = Math.abs(Math.min(0, minTop));
  const leftAdjust = Math.abs(Math.min(0, minLeft));

  const grid: LetterOrEmpty[][] = Array.from({length: numRows}, () =>
    Array.from({length: numCols}, () => ""),
  );
  for (let pieceIndex = 0; pieceIndex < pieceData.length; pieceIndex++) {
    grid[pieceData[pieceIndex].top + topAdjust][
      pieceData[pieceIndex].left + leftAdjust
    ] = pieceData[pieceIndex].letter;
  }
  return {
    letters: grid,
    id,
    solutionTop: rowIndex - topAdjust,
    solutionLeft: colIndex - leftAdjust,
  };
}
