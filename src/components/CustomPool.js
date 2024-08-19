import React from "react";
import Piece from "./Piece";

export default function CustomPool({
  pieces,
  dispatchGameState,
}) {
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

  return <div id="pool">{pieceElements}</div>;
}

export function dragDestinationInPool(pointer) {
  const poolElement =
    document.getElementById("pool") || document.getElementById("result");
  const poolRect = poolElement.getBoundingClientRect();
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
        const slotRect = element.getBoundingClientRect();
        if (positionIsBeforeRectangle(pointer, slotRect)) {
          break;
        }
        index++;
      }
    }
    return {where: "pool", index};
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
