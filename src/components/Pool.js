import React from "react";
import Piece from "./Piece";

export default function Pool({ pieces, dispatchGameState }) {
  const poolPieces = pieces.filter((piece) => piece.poolIndex >= 0);
  poolPieces.sort((a, b) => a.poolIndex - b.poolIndex);

  const dragController = { dispatchGameState };
  const pieceElements = poolPieces.map((piece) => (
    <Piece
      key={piece.id}
      piece={piece}
      where="pool"
      overlapGrid={undefined}
      gameIsSolved={false}
      dragController={dragController}
    />
  ));

  return <div id="pool">{pieceElements}</div>;
}
