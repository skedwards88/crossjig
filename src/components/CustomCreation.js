import React from "react";
import CustomPool from "./CustomPool";
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
      id="game"
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
        gridSize={12}
        customCreation={true}
      ></Board>
      <CustomPool
        pieces={customState.pieces}
        dragDestination={customState.dragState?.destination}
        dispatchGameState={dispatchCustomState} // todo just rename dispatch params to dispatcher everywhere
      ></CustomPool>
      {dragGroup}
    </div>
  );
}

export default CustomCreation;
