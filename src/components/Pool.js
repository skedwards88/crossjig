import React from "react";
import Piece from "./Piece";
import DragShadow from "./DragShadow";
import { countingGrid } from "./Board";

export default function Pool({ pieces, dragDestination, dispatchGameState }) {
  const poolPieces = pieces.filter((piece) => piece.poolIndex >= 0);
  poolPieces.sort((a, b) => a.poolIndex - b.poolIndex);

  const pieceElements = poolPieces.map((piece) => (
    <div className="pool-slot" key={piece.id}>
      <Piece
        key={piece.id}
        piece={piece}
        where="pool"
        overlapGrid={undefined}
        gameIsSolved={false}
        dispatchGameState={dispatchGameState}
      />
    </div>
  ));

  if (dragDestination?.where === "pool") {
    const draggedPieces = pieces.filter((piece) => piece.groupTop >= 0);
    pieceElements.splice(
      dragDestination.index,
      0,
      draggedPieces.map((piece) => (
        <div className="pool-slot shadow" key={piece.id}>
          <DragShadow
            key={`shadow-piece-${piece.id}`}
            grid={countingGrid(piece.letters.length, piece.letters[0].length, [
              { ...piece, groupTop: 0, groupLeft: 0 },
            ])}
          />
        </div>
      ))
    );
  }

  return <div id="pool">{pieceElements}</div>;
}

export function dragDestinationInPool(pointer) {
  let poolElement = document.getElementById("pool") || document.getElementById("result");
  let poolRect = poolElement.getBoundingClientRect();
  if (
    poolRect.left <= pointer.x &&
    pointer.x <= poolRect.right &&
    poolRect.top <= pointer.y &&
    pointer.y <= poolRect.bottom
  ) {
    let index = 0;
    for (let element of poolElement.children) {
      // Note: Exact match on className so we don't count shadows.
      if (element.className === "pool-slot") {
        if (positionIsBeforeRectangle(pointer, element.getBoundingClientRect())) {
          break;
        }
        index++;
      }
    }
    return { where: "pool", index };
  }
  return undefined;
}

function positionIsBeforeRectangle(point, rect) {
  if (rect.bottom < point.y) {
    return false;
  } else if (point.y < rect.top) {
    return true;
  } else if (rect.right < point.x) {
    return false;
  } else if (point.x < rect.left) {
    return true;
  } else {
    // The point is inside the rectangle.
    // We'll say it's before if it's left of the center.
    return point.x < (rect.right + rect.left) / 2;
  }
}
