import {getPieceDimension} from "./getPieceDimension";

// input is:
// - pieceData: an array of objects:
//   - letter: the letter
//   - top: the vertical location in the piece
//   - left: the horizontal location in the piece
// rowIndex todo
// colIndex todo
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
// - letters: a 2D grid of letters in the piece. Defined at the start of the game.
// - id: An identifier that is unique to the piece. Defined at the start of the game.
// - solutionTop: The vertical location of the top of the piece in the solved puzzle. Defined at the start of the game.
// - solutionLeft: The horizontal location of the left side of the piece in the solved puzzle. Defined at the start of the game.
// - poolIndex: The position of the piece in the pool. Undefined if the piece is on the board or being dragged.
// - boardTop: The current vertical location of the top of the piece in the board. Undefined if the piece is in the pool or being dragged.
// - boardLeft: The current horizontal location of the left of the piece in the board. Undefined if the piece is in the pool or being dragged
// - dragGroupTop: todo. Undefined if the piece is not being dragged.
// - dragGroupLeft: todo. Undefined if the piece is not being dragged.
export function updatePieceDatum(oldPieceData = {}, updates = {}) {
  return {
    ...oldPieceData,
    ...updates,
  };
}
