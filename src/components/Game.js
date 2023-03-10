import React from "react";
import Pool from "./Pool";
import Result from "./Result";
import Board from "./Board";
import ControlBar from "./ControlBar";

function Game({
  dispatchGameState,
  gameState,
  setDisplay,
  setInstallPromptEvent,
  showInstallButton,
  installPromptEvent,
}) {
  function dragToken({
    event,
    dragArea,
    pieceID,
    relativeTop,
    relativeLeft,
    boardTop,
    boardLeft,
  }) {
    event.dataTransfer.setDragImage(document.createElement("img"), 0, 0);
    event.dataTransfer.setData(
      "draggedElementID",
      event.target.parentElement.id
    );
    if (dragArea === "pool") {
      event.target.parentElement.classList.add("dragging");
    }
    dispatchGameState({
      action: "startDrag",
      pieceID: pieceID,
      dragArea: dragArea,
      relativeTop: relativeTop,
      relativeLeft: relativeLeft,
      boardLeft: boardLeft,
      boardTop: boardTop,
    });
  }

  function dropOnPool({ event, targetPieceID }) {
    // Can drop on a pool piece or an empty section of the pool,
    // so prevent bubbling up so that this handler doesn't execute twice
    // when drop on a pool piece
    event.stopPropagation();

    event.preventDefault();

    document
      .getElementById(event.dataTransfer.getData("draggedElementID"))
      .classList.remove("dragging");

    dispatchGameState({
      action: "dropOnPool",
      targetPieceID: targetPieceID,
    });
  }

  function handleBoardDrop({ event, rowIndex, colIndex }) {
    event.preventDefault();
    document
      .getElementById(event.dataTransfer.getData("draggedElementID"))
      .classList.remove("dragging");

    dispatchGameState({
      action: "dropOnBoard",
      dropRowIndex: rowIndex,
      dropColIndex: colIndex,
    });
  }

  function handlePoolDragEnter({ event, targetPieceID }) {
    // Can drop on a pool piece or an empty section of the pool,
    // so prevent bubbling up so that this handler doesn't execute twice
    // when drop on a pool piece
    event.stopPropagation();

    event.preventDefault();
    dispatchGameState({
      action: "dragOverPool",
      targetPieceID: targetPieceID,
    });
  }

  function handleBoardDragEnter({ event, rowIndex, colIndex }) {
    event.preventDefault();

    dispatchGameState({
      action: "dragOverBoard",
      dropRowIndex: rowIndex,
      dropColIndex: colIndex,
    });
  }

  return (
    <div className="App" id="crossjig">
      <Board
        pieces={gameState.pieces}
        handleBoardDragEnter={handleBoardDragEnter}
        handleBoardDrop={handleBoardDrop}
        gridSize={gameState.gridSize}
        dragToken={dragToken}
      ></Board>
      {gameState.pieces.filter((piece) => piece.poolIndex >= 0).length ? (
        <Pool
          pieces={gameState.pieces}
          dropOnPool={dropOnPool}
          handlePoolDragEnter={handlePoolDragEnter}
          dragToken={dragToken}
        ></Pool>
      ) : (
        <Result
          dropToken={dropOnPool}
          dispatchGameState={dispatchGameState}
          gameState={gameState}
        ></Result>
      )}

      <ControlBar
        setDisplay={setDisplay}
        setInstallPromptEvent={setInstallPromptEvent}
        showInstallButton={showInstallButton}
        installPromptEvent={installPromptEvent}
        dispatchGameState={dispatchGameState}
        gameState={gameState}
      ></ControlBar>
    </div>
  );
}

export default Game;
