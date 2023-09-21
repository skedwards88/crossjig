import React from "react";
import Piece from "./Piece";

export default function Pool({
  pieces,
  dropOnPool,
  handlePoolDragEnter,
  dragToken,
  draggedPieceIDs,
  dispatchGameState,
}) {
  const poolPieces = pieces.filter((piece) => piece.poolIndex >= 0);
  poolPieces.sort((a, b) => a.poolIndex - b.poolIndex);

  const dragController = {
    dragToken: dragToken,
    handlePoolDragEnter: handlePoolDragEnter,
    dropOnPool: dropOnPool,
    dispatchGameState: dispatchGameState,
  };
  const pieceElements = poolPieces.map((piece) => (
    <Piece
      key={piece.id}
      piece={piece}
      isDragging={draggedPieceIDs.includes(piece.id)}
      dragController={dragController}
    ></Piece>
  ));

  return (
    <div
      id="pool"
      onDrop={(event) => {
        event.preventDefault();
        dropOnPool({ event });
      }}
      onDragEnd={(event) => {
        event.preventDefault();
      }}
      onDragEnter={(event) => {
        handlePoolDragEnter({ event });
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
    >
      {pieceElements}
    </div>
  );
}
