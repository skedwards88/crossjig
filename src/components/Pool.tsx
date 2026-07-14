import Piece from "./Piece";
import DragShadow from "./DragShadow";
import {getLetterCountPerSquare} from "../logic/getLetterCountPerSquare";
import type {GameReducerPayload} from "../logic/gameReducer";
import type {
  DragDestination,
  DragDestinationPool,
  PieceInDrag,
  PieceInGame,
  PieceInPool,
  Position,
} from "../Types";
import type {
  PieceInCustom,
  PieceInCustomDrag,
  PieceInCustomPool,
} from "../logic/customCreationInit";
import {type CustomCreationReducerPayload} from "../logic/customCreationReducer";
import {type DailyReducerPayload} from "../logic/dailyReducer";
import {type AdventureReducerPayload} from "../logic/adventure";

export default function Pool<T extends PieceInGame | PieceInCustom>({
  pieces,
  dragDestination,
  dispatchGameState,
}: {
  pieces: T[];
  dragDestination?: DragDestination;
  dispatchGameState:
    | React.Dispatch<GameReducerPayload>
    | React.Dispatch<AdventureReducerPayload>
    | React.Dispatch<DailyReducerPayload>
    | React.Dispatch<CustomCreationReducerPayload>;
}): React.JSX.Element {
  const poolPieces = pieces.filter(
    (piece): piece is T & (PieceInPool | PieceInCustomPool) =>
      piece.poolIndex != undefined,
  );
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
    const draggedPieces = pieces.filter(
      (piece): piece is T & (PieceInDrag | PieceInCustomDrag) =>
        piece.dragGroupTop != undefined,
    );
    pieceElements.splice(
      dragDestination.index,
      0,
      ...draggedPieces.map((piece) => (
        <div className="pool-slot shadow" key={piece.id}>
          <DragShadow
            key={`shadow-piece-${piece.id}`}
            grid={getLetterCountPerSquare(
              piece.letters.length,
              piece.letters[0].length,
              [{...piece, dragGroupTop: 0, dragGroupLeft: 0}],
            )}
          />
        </div>
      )),
    );
  }

  return <div id="pool">{pieceElements}</div>;
}

export function dragDestinationInPool(
  pointer: Position,
): DragDestinationPool | undefined {
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
    for (const element of poolElement.children) {
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

function positionIsBeforeRectangle(point: Position, rect: DOMRect): boolean {
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
