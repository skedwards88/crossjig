// todo wip new, incomplete file

import React from "react";
import CustomPool from "./CustomPool";
import CustomBoard from "./CustomBoard";
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
        "--grid-rows": 12,
        "--grid-columns": 12,
        "--validity-opacity": validityOpacity,
      }}
    >
      <CustomBoard
        customState={customState}
        gridSize={12}
        dispatchGameState={dispatchCustomState}
        indicateValidity={validityOpacity > 0}
        dragDestination={customState.dragState?.destination}
        dragPieceIDs={customState.dragState?.pieceIDs}
      ></CustomBoard>
      <CustomPool
          customState={customState}
          dragDestination={customState.dragState?.destination}
          dispatchGameState={dispatchCustomState} // todo just rename dispatch params to dispatcher everywhere
        ></CustomPool>
        {dragGroup}
    </div>
  );
}

export default CustomCreation;
