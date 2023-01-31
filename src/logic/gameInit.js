import { generateGrid } from "./generateGrid";
import { shuffleArray } from "@skedwards88/word_logic";

function centerGrid(grid) {
  let shiftedGrid = JSON.parse(JSON.stringify(grid));

  const emptyRow = Array(grid.length).fill("");

  // determine the number of current empty edge rows
  // and the number of empty edge rows when centered
  const { maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown } =
    getMaxShifts(grid);
  const averageShiftLeftRight = (maxShiftLeft + maxShiftRight) / 2;
  const newMaxShiftLeft = Math.floor(averageShiftLeftRight);
  const newMaxShiftRight = Math.ceil(averageShiftLeftRight);
  const averageShiftUpDown = (maxShiftUp + maxShiftDown) / 2;
  const newMaxShiftUp = Math.floor(averageShiftUpDown);
  const newMaxShiftDown = Math.ceil(averageShiftUpDown);

  // trim the empty rows, then pad with empty rows to center
  const cutTopBottom = shiftedGrid.slice(
    maxShiftUp,
    shiftedGrid.length - maxShiftDown
  );
  shiftedGrid = [
    ...Array(newMaxShiftUp).fill(emptyRow),
    ...cutTopBottom,
    ...Array(newMaxShiftDown).fill(emptyRow),
  ];

  // transpose
  shiftedGrid = shiftedGrid.map((_, index) =>
    shiftedGrid.map((row) => row[index])
  );

  // trim the empty rows, then pad with empty rows to center
  const cutLeftRight = shiftedGrid.slice(
    maxShiftLeft,
    shiftedGrid.length - maxShiftRight
  );
  shiftedGrid = [
    ...Array(newMaxShiftLeft).fill(emptyRow),
    ...cutLeftRight,
    ...Array(newMaxShiftRight).fill(emptyRow),
  ];

  // un transpose
  shiftedGrid = shiftedGrid.map((_, index) =>
    shiftedGrid.map((row) => row[index])
  );

  return shiftedGrid;
}

function getMaxShifts(grid) {
  const transposedGrid = grid.map((_, index) => grid.map((row) => row[index]));

  let maxShiftUp = 0;
  for (let index = 0; index < grid.length; index++) {
    if (grid[index].every((i) => i === "")) {
      maxShiftUp++;
    } else {
      break;
    }
  }

  let maxShiftDown = 0;
  for (let index = grid.length - 1; index >= 0; index--) {
    if (grid[index].every((i) => i === "")) {
      maxShiftDown++;
    } else {
      break;
    }
  }

  let maxShiftLeft = 0;
  for (let index = 0; index < transposedGrid.length; index++) {
    if (transposedGrid[index].every((i) => i === "")) {
      maxShiftLeft++;
    } else {
      break;
    }
  }

  let maxShiftRight = 0;
  for (let index = transposedGrid.length - 1; index >= 0; index--) {
    if (transposedGrid[index].every((i) => i === "")) {
      maxShiftRight++;
    } else {
      break;
    }
  }

  return {
    maxShiftDown: maxShiftDown,
    maxShiftLeft: maxShiftLeft,
    maxShiftRight: maxShiftRight,
    maxShiftUp: maxShiftUp,
  };
}

function getPieceDimension(pieceData) {
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

function assemblePiece({ pieceData, rowIndex, colIndex }) {
  const { numCols, numRows, minTop, minLeft } = getPieceDimension(pieceData);
  const topAdjust = Math.abs(Math.min(0, minTop));
  const leftAdjust = Math.abs(Math.min(0, minLeft));

  let grid = Array.from({ length: numRows }, () =>
    Array.from({ length: numCols }, () => "")
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

function makePieces(grid) {
  const maxPieceLetters = 5; //todo can randomize num letters
  const maxPieceDimension = 3;
  const remainingGrid = JSON.parse(JSON.stringify(grid));
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
              const { numCols, numRows } = getPieceDimension([
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
    })
  );
  return pieces;
}

export function gameInit({ numLetters, useSaved = true }) {
  const savedState = useSaved
    ? JSON.parse(localStorage.getItem("crossjigState"))
    : undefined;

  if (
    savedState &&
    savedState.pieces &&
    savedState.gridSize &&
    savedState.numLetters
  ) {
    return savedState;
  }

  const gridSize = 12;
  const minLetters = numLetters || 40;
  // Generate grid with words that are 4-7 letters
  const grid = generateGrid({
    gridSize: gridSize,
    minLetters: minLetters,
  });

  const centeredGrid = centerGrid(grid);

  const { maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown } =
    getMaxShifts(centeredGrid);

  const pieces = shuffleArray(makePieces(centeredGrid));
  const pieceData = pieces.map((piece, index) => ({
    letters: piece.letters,
    id: index,
    boardTop: undefined,
    boardLeft: undefined,
    poolIndex: index,
    solutionTop: piece.solutionTop,
    solutionLeft: piece.solutionLeft,
  }));

  return {
    pieces: pieceData,
    gridSize: gridSize,
    numLetters: minLetters,
    maxShiftLeft: maxShiftLeft,
    maxShiftRight: maxShiftRight,
    maxShiftUp: maxShiftUp,
    maxShiftDown: maxShiftDown,
  };
}
