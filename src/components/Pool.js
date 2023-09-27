import React from "react";
import Piece from "./Piece";
import DragShadow from "./DragShadow";
import { countingGrid } from "./Board";

export default function Pool({ pieces, dragDestination, dispatchGameState }) {
  const poolPieces = pieces.filter((piece) => piece.poolIndex >= 0);
  poolPieces.sort((a, b) => a.poolIndex - b.poolIndex);

  const pieceElements = poolPieces.map((piece) => (
    <Piece
      key={piece.id}
      piece={piece}
      where="pool"
      overlapGrid={undefined}
      gameIsSolved={false}
      dispatchGameState={dispatchGameState}
    />
  ));

  if (dragDestination?.where === "pool") {
    const draggedPieces = pieces.filter((piece) => piece.groupTop >= 0);
    pieceElements.splice(
      dragDestination.index,
      0,
      draggedPieces.map((piece) => (
        <DragShadow
          key={`shadow-piece-${piece.id}`}
          grid={countingGrid(piece.letters.length, piece.letters[0].length, [
            { ...piece, groupTop: 0, groupLeft: 0 },
          ])}
        />
      ))
    );
  }

  return <div id="pool">{pieceElements}</div>;
}
