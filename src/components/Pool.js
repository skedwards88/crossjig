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

  const pieceElements = poolPieces.map((piece) => (
    <Piece
      letters={piece.letters}
      pieceID={piece.id}
      handlePoolDragEnter={handlePoolDragEnter}
      key={piece.id}
      isDragging={draggedPieceIDs.includes(piece.id)}
      dragToken={dragToken}
      dropOnPool={dropOnPool}
      dispatchGameState={dispatchGameState}
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
