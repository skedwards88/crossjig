import React from "react";
import Pool from "./Pool";
import Result from "./Result";
import Board from "./Board";
import Piece from "./Piece";

function DragGroup({ dispatchGameState, gameState }) {
  const dragState = gameState.dragState;
  if (dragState === undefined) {
    return <></>;
  }

  const isShifting = dragState.isShifting;
  let draggedPieces = gameState.pieces
    .filter((piece) => dragState.pieceIDs.includes(piece.id))
    .map((piece) => (
      <Piece
        key={piece.id}
        piece={piece}
        where="drag"
        overlapGrid={undefined}
        gameIsSolved={false}
        dragController={{ dispatchGameState }}
      />
    ));

  const dragGroup = React.useRef(null);
  React.useEffect(
    () => {
      dragGroup.current.setPointerCapture(dragState.pointerID);
      if (!dragGroup.current.hasPointerCapture(dragState.pointerID)) {
        console.warn("Failed to capture pointer");
        // TODO: drop all dragged pieces
      }
      return () => {
        if (dragGroup.current) {
          dragGroup.current.releasePointerCapture(dragState.pointerID);
        }
      };
    },
    [dragState.pointerID]
  );

  const onPointerMove = (event) => {
    event.preventDefault();
    dispatchGameState({
      action: !isShifting ? "dragMove" : "shiftMove",
      pointer: { x: event.clientX, y: event.clientY },
    });
  };
  const onLostPointerCapture = (event) => {
    onPointerMove(event);
    dispatchGameState({ action: !isShifting ? "dragEnd" : "shiftEnd" });
  };

  return (
    <div
      id="dragGroup"
      ref={dragGroup}
      style={{
        position: "absolute",
        top: dragState.pointer.y - dragState.pointerOffset.y,
        left: dragState.pointer.x - dragState.pointerOffset.x,
      }}
      onPointerMove={onPointerMove}
      onLostPointerCapture={onLostPointerCapture}
    >
      {draggedPieces}
    </div>
  );
}

function Game({ dispatchGameState, gameState, setDisplay }) {
  return (
    <div id="game">
      <Board
        pieces={gameState.pieces}
        gridSize={gameState.gridSize}
        gameIsSolved={gameState.gameIsSolved}
        dispatchGameState={dispatchGameState}
      ></Board>
      {gameState.allPiecesAreUsed ? (
        <Result
          dispatchGameState={dispatchGameState}
          gameState={gameState}
          setDisplay={setDisplay}
        ></Result>
      ) : (
        <Pool
          pieces={gameState.pieces}
          dispatchGameState={dispatchGameState}
        ></Pool>
      )}
      <DragGroup dispatchGameState={dispatchGameState} gameState={gameState} />
    </div>
  );
}

export default Game;
