import type {LetterOrEmpty, PieceInBoard, PieceWithoutLocation} from "../Types";

export function getGridFromPieces({
  pieces,
  gridSize,
  solution,
}:
  | {pieces: PieceWithoutLocation[]; gridSize: number; solution: true}
  | {
      pieces: PieceInBoard[];
      gridSize: number;
      solution: false;
    }): LetterOrEmpty[][] {
  // Compiles a 2D array representing the letter locations on the board
  // If solution is true, uses the solutionTop/solutionLeft value of each piece
  // otherwise, uses the boardTop/boardLeft value
  if (pieces === undefined) {
    throw new Error("Pieces must be defined.");
  }

  if (gridSize === undefined) {
    throw new Error("Grid size must be defined.");
  }

  const grid: LetterOrEmpty[][] = Array.from({length: gridSize}, () =>
    Array.from({length: gridSize}, () => ""),
  );

  for (const piece of pieces) {
    if (
      !solution &&
      ((piece as PieceInBoard).boardTop == undefined ||
        (piece as PieceInBoard).boardLeft == undefined) // ts doesn't remember that piece is PieceInBoard if solution is false, so have to typecast here. (Alternatively could not destructure the args until here, but I don't want to deviate from my coding style to satisfy a ts shortcoming.)
    ) {
      continue;
    }
    const letters = piece.letters;
    let top = solution ? piece.solutionTop : (piece as PieceInBoard).boardTop; // same typecasting reason as above
    for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
      let left = solution
        ? piece.solutionLeft
        : (piece as PieceInBoard).boardLeft; // same typecasting reason as above
      for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
        if (letters[rowIndex][colIndex]) {
          if (grid[top][left] == undefined) {
            throw new Error("A piece falls outside of the grid boundary.");
          }
          grid[top][left] = letters[rowIndex][colIndex];
        }
        left += 1;
      }
      top += 1;
    }
  }
  return grid;
}
