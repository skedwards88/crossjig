import type {GameState, PieceInGame} from "../Types";

export function giveHint(currentState: GameState): PieceInGame[] {
  const pieces = structuredClone(currentState.pieces);
  const {maxShiftLeft, maxShiftRight, maxShiftUp, maxShiftDown} = currentState;

  let shiftLeft;
  let shiftUp;
  // check each piece until we find one on the board within the shift range
  for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
    const {boardLeft, boardTop, solutionLeft, solutionTop} = pieces[pieceIndex];
    // if the piece is not on the board, skip to the next piece
    if (boardLeft === undefined || boardTop === undefined) {
      continue;
    }

    // if the piece is on the board, check whether it is within the shift range
    // (i.e. if the diff between the piece's actual position and its official solution position is <= the maximum amount that the official solution can shift)
    //   if yes, set the shift and break loop
    const actualShiftLeft = solutionLeft - boardLeft;
    const actualShiftUp = solutionTop - boardTop;
    if (
      actualShiftLeft <= maxShiftLeft &&
      actualShiftUp <= maxShiftUp &&
      -1 * actualShiftLeft <= maxShiftRight &&
      -1 * actualShiftUp <= maxShiftDown
    ) {
      shiftLeft = actualShiftLeft;
      shiftUp = actualShiftUp;
      break;
    }
  }

  // Correctly align the pieces on the board
  const realignedPieces: PieceInGame[] = [];
  let numRealigned = 0;

  for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
    const {boardLeft, boardTop, solutionLeft, solutionTop} = pieces[pieceIndex];

    // if the piece is not on the board, skip to the next piece
    if (boardLeft === undefined || boardTop === undefined) {
      realignedPieces.push(pieces[pieceIndex]);
      continue;
    }

    // if we found a piece on the board that is within the shift range,
    //   realign all other pieces on the board to match if they don't already.
    // if didn't find any pieces on the board within the shift range,
    //   move all pieces on the board into place based on the official solution
    const newLeft = solutionLeft - (shiftLeft ?? 0);
    const newTop = solutionTop - (shiftUp ?? 0);
    const realignedPiece = {
      ...pieces[pieceIndex],
      boardLeft: newLeft,
      boardTop: newTop,
      poolIndex: undefined,
      dragGroupTop: undefined,
      dragGroupLeft: undefined,
    };
    realignedPieces.push(realignedPiece);

    // Record whether we shifted the piece
    if (boardLeft != newLeft || boardTop != newTop) {
      numRealigned++;
    }
  }

  // if we didn't need to move any pieces that are already on the board, move one new piece onto the board
  if (!numRealigned) {
    for (
      let pieceIndex = 0;
      pieceIndex < realignedPieces.length;
      pieceIndex++
    ) {
      const {boardLeft, boardTop, solutionLeft, solutionTop} =
        realignedPieces[pieceIndex];
      // if the piece is not on the board, add it to the board and break the loop
      if (boardLeft === undefined || boardTop === undefined) {
        realignedPieces[pieceIndex] = {
          ...realignedPieces[pieceIndex],
          boardLeft: solutionLeft - (shiftLeft ?? 0),
          boardTop: solutionTop - (shiftUp ?? 0),
          poolIndex: undefined,
          dragGroupTop: undefined,
          dragGroupLeft: undefined,
        };
        break;
      }
    }
  }

  return realignedPieces;
}
