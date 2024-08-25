import React from "react";
import Pool from "./Pool";
import Board from "./Board";
import DragGroup from "./DragGroup";

function CustomCreation({dispatchCustomState, customState, validityOpacity}) {
  // dragCount ensures a different key each time, so a fresh DragGroup is mounted even if there's
  // no render between one drag ending and the next one starting.
  const dragGroup = customState.dragState ? (
    <DragGroup
      key={customState.dragCount}
      dispatchGameState={dispatchCustomState}
      gameState={customState}
    />
  ) : null;

  return (
    <div
      id="custom"
      style={{
        "--grid-rows": customState.gridSize,
        "--grid-columns": customState.gridSize,
        "--validity-opacity": validityOpacity,
      }}
    >
      <Board
        pieces={customState.pieces}
        gameIsSolved={false}
        dispatchGameState={dispatchCustomState}
        indicateValidity={validityOpacity > 0}
        dragPieceIDs={customState.dragState?.pieceIDs}
        dragDestination={customState.dragState?.destination}
        gridSize={customState.gridSize}
        customCreation={true}
      ></Board>
      <Pool
        // don't pass drag destination so that won't render drag shadow on pool
        pieces={customState.pieces}
        dispatchGameState={dispatchCustomState}
      ></Pool>
      {dragGroup}
    </div>
  );
}

export default CustomCreation;
