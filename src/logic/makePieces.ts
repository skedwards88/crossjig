import cloneDeep from "lodash.clonedeep";
import {assemblePiece} from "./assemblePiece";
import {getPieceDimension} from "./getPieceDimension";

export function makePieces(grid) {
  const maxPieceLetters = 5;
  const maxPieceDimension = 3;
  const remainingGrid = cloneDeep(grid);
  const piecesData = [];

  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
      // at this index, check if there is a letter in the remaining grid
      if (remainingGrid[rowIndex][colIndex]) {
        // if there is a letter, remove the letter from the remaining grid and start a piece
        const letter = remainingGrid[rowIndex][colIndex];
        let pieceData = [
          {
            letter: letter,
            top: 0,
            left: 0,
          },
        ];
        remainingGrid[rowIndex][colIndex] = "";

        // from this starting point, look in each direction for a letter
        let pieceLevel = 0;
        const directions = [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ]; //todo can randomize order
        // Keep adding letters to the piece
        // until the piece has the max number of letters
        // or until we have searched around all of the letters in the piece
        while (
          pieceData.length < maxPieceLetters &&
          pieceLevel < pieceData.length
        ) {
          let surroundedPieceRow = pieceData[pieceLevel].top;
          let surroundedPieceCol = pieceData[pieceLevel].left;
          for (
            let directionIndex = 0;
            directionIndex < directions.length;
            directionIndex++
          ) {
            const [rowOffset, colOffset] = directions[directionIndex];
            // if there is a letter
            if (
              remainingGrid?.[rowIndex + surroundedPieceRow + rowOffset]?.[
                colIndex + surroundedPieceCol + colOffset
              ]
            ) {
              // and if adding this letter to the piece won't exceed the max piece dimension
              const {numCols, numRows} = getPieceDimension([
                ...pieceData,
                {
                  top: surroundedPieceRow + rowOffset,
                  left: surroundedPieceCol + colOffset,
                },
              ]);
              if (
                numCols <= maxPieceDimension &&
                numRows <= maxPieceDimension
              ) {
                // remove the letter from the remaining grid and add it to the piece
                const surroundingLetter =
                  remainingGrid[rowIndex + surroundedPieceRow + rowOffset][
                    colIndex + surroundedPieceCol + colOffset
                  ];
                pieceData.push({
                  letter: surroundingLetter,
                  top: surroundedPieceRow + rowOffset,
                  left: surroundedPieceCol + colOffset,
                });
                remainingGrid[rowIndex + surroundedPieceRow + rowOffset][
                  colIndex + surroundedPieceCol + colOffset
                ] = "";
              }
            }
          }
          pieceLevel++;
        }
        piecesData.push({
          pieceData: pieceData,
          rowIndex: rowIndex,
          colIndex: colIndex,
        });
      }
    }
  }
  const pieces = piecesData.map((data) =>
    assemblePiece({
      pieceData: data.pieceData,
      rowIndex: data.rowIndex,
      colIndex: data.colIndex,
    }),
  );
  return pieces;
}
