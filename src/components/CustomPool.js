// todo wip new, incomplete file

import React from "react";
import Piece from "./Piece";



// Unlike the game pool, where letters in the pool can be moved around, letters in the pool never get used up or reordered.
export default function CustomPool({customState, dispatchGameState}) {

  const poolPieces = customState.pieces.filter((piece) => piece.poolIndex >= 0);

  const pieceElements = poolPieces.map((piece) => (
    <div className="pool-slot" key={piece.id}>
      <Piece
        key={piece.id}
        piece={piece}
        where="pool"
        overlapGrid={undefined}
        gameIsSolved={false}
        dispatchGameState={dispatchGameState}
      />
    </div>
  ));

  return <div id="pool">{pieceElements}</div>;
}
