import {getPieceDimension} from "./getPieceDimension";

// input is:
// - pieceData: an array of objects:
//   - letter: the letter
//   - top: the vertical location in the piece
//   - left: the horizontal location in the piece
// rowIndex: The vertical location of the piece in the board, relative to how top/left for each letter in pieceData are defined.
// colIndex The horizontal location of the piece in the board, relative to how top/left for each letter in pieceData are defined.
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
  return updatePieceDatum({
    letters: grid,
    solutionTop: rowIndex - topAdjust,
    solutionLeft: colIndex - leftAdjust,
    boardTop: undefined,
    boardLeft: undefined,
  });
}

// The purpose of this function is just to clearly delineate when I am updating the piece data
// piece data is:
// - letters (array of array of strings): a 2D grid of letters in the piece. Defined at the start of the game.
// - id (integer): An identifier that is unique to the piece. Defined at the start of the game.
// - solutionTop (integer): The vertical location of the top of the piece in the solved puzzle. Defined at the start of the game.
// - solutionLeft (integer): The horizontal location of the left side of the piece in the solved puzzle. Defined at the start of the game.
// - poolIndex (integer or undefined): The position of the piece in the pool. Undefined if the piece is on the board or being dragged.
// - boardTop (integer or undefined): The current vertical location of the top of the piece in the board. Undefined if the piece is in the pool or being dragged.
// - boardLeft (integer or undefined): The current horizontal location of the left of the piece in the board. Undefined if the piece is in the pool or being dragged
// - dragGroupTop (integer or undefined): The vertical distance from the top of the piece to the top of the collection of pieces being dragged. Undefined if the piece is not being dragged.
// - dragGroupLeft (integer or undefined): The horizontal distance from the left of the piece to the left of the collection of pieces being dragged. Undefined if the piece is not being dragged.
export function updatePieceDatum(oldPieceData = {}, updates = {}) {
  return {
    ...oldPieceData,
    ...updates,
  };
}
