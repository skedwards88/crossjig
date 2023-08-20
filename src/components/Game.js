import React from "react";
import Pool from "./Pool";
import Result from "./Result";
import Board from "./Board";

function Game({ dispatchGameState, gameState, setDisplay }) {
  function dragToken({
    event,
    dragArea, // where the drag originated: board or pool
    pieceID, // the ID of the piece being dragged (undefined if dragging blank spot on board)
    relativeTop, // the row of letters in the piece being dragged (undefined if dragging blank spot on board)
    relativeLeft, // the col of letters in the piece being dragged (undefined if dragging blank spot on board)
    boardTop, // the row on the board being dragged (undefined if dragging piece from pool)
    boardLeft, // the col on the board being dragged (undefined if dragging piece from pool)
  }) {
    event.dataTransfer.setDragImage(document.createElement("img"), 0, 0);
    event.dataTransfer.setData(
      "draggedElementID",
      event.target.parentElement.id
    );
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

    dispatchGameState({
      action: "dropOnPool",
      targetPieceID: targetPieceID,
    });
  }

  function handleBoardDrop({ event, rowIndex, colIndex }) {
    event.preventDefault();

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
    <div id="game">
      <Board
        pieces={gameState.pieces}
        handleBoardDragEnter={handleBoardDragEnter}
        handleBoardDrop={handleBoardDrop}
        gridSize={gameState.gridSize}
        dragToken={dragToken}
        gameIsSolved={gameState.gameIsSolved}
        dispatchGameState={dispatchGameState}
        draggedPieceIDs={
          gameState.dragData?.connectedPieceIDs || [
            gameState.dragData?.pieceID,
          ] ||
          []
        }
      ></Board>
      {gameState.allPiecesAreUsed ? (
        <Result
          dropToken={dropOnPool}
          dispatchGameState={dispatchGameState}
          gameState={gameState}
          setDisplay={setDisplay}
        ></Result>
      ) : (
        <Pool
          pieces={gameState.pieces}
          dropOnPool={dropOnPool}
          handlePoolDragEnter={handlePoolDragEnter}
          dragToken={dragToken}
          draggedPieceIDs={
            gameState.dragData?.connectedPieceIDs || [
              gameState.dragData?.pieceID,
            ] ||
            []
          }
        ></Pool>
      )}
    </div>
  );
}

export default Game;
