import type {GameReducerPayload} from "../logic/gameReducer";
import type {
  Letter as LetterType,
  PieceInGame,
  PieceInBoard,
  PieceInDrag,
  CSSPropertiesWithVars,
} from "../Types";

function Letter({
  pieceID,
  letter,
  pieceRowIndex,
  pieceColIndex,
  overlapping,
  isHorizontallyValid,
  isVerticallyValid,
  gameIsSolved,
  dispatchGameState,
}: {
  pieceID: number;
  letter: LetterType;
  pieceRowIndex: number;
  pieceColIndex: number;
  overlapping: boolean | undefined;
  isHorizontallyValid: boolean | undefined;
  isVerticallyValid: boolean | undefined;
  gameIsSolved: boolean;
  dispatchGameState: React.Dispatch<GameReducerPayload>;
}): React.JSX.Element {
  let className = "letter";
  if (gameIsSolved) {
    className += " filled";
  }
  if (overlapping) {
    className += " overlapping";
  }
  if (isHorizontallyValid) {
    className += " horizontalValid";
  }
  if (isVerticallyValid) {
    className += " verticalValid";
  }

  return (
    <div
      className={className}
      style={{
        gridRow: pieceRowIndex + 1, // CSS grid coordinates are 1-based
        gridColumn: pieceColIndex + 1,
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const pointerStartPosition = {x: event.clientX, y: event.clientY};
        dispatchGameState({
          action: "dragStart",
          pieceID,
          pointerID: event.pointerId,
          pointerStartPosition,
        });
      }}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      {letter}
    </div>
  );
}

function LetterBorder({
  rowIndex,
  colIndex,
  border,
}: {
  rowIndex: number;
  colIndex: number;
  border: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
}): React.JSX.Element {
  let className = "letter-border";
  if (border.top) {
    className += " borderTop";
  }
  if (border.bottom) {
    className += " borderBottom";
  }
  if (border.left) {
    className += " borderLeft";
  }
  if (border.right) {
    className += " borderRight";
  }
  return (
    <div
      className={className}
      style={{
        gridRow: rowIndex + 1, // CSS grid coordinates are 1-based
        gridColumn: colIndex + 1,
      }}
    />
  );
}

export default function Piece({
  piece,
  where,
  overlapGrid,
  horizontalValidityGrid,
  verticalValidityGrid,
  gameIsSolved,
  dispatchGameState,
}: {
  piece: PieceInGame;
  where: "pool" | "board" | "drag";
  overlapGrid?: number[][] | undefined;
  horizontalValidityGrid?: boolean[][] | undefined;
  verticalValidityGrid?: boolean[][] | undefined;
  gameIsSolved: boolean;
  dispatchGameState: React.Dispatch<GameReducerPayload>;
}): React.JSX.Element {
  const isOnBoard = where == "board";
  const isDragging = where == "drag";
  const letters = piece.letters;
  const letterElements = [];
  const borderElements = [];
  for (let rowIndex = 0; rowIndex < letters.length; rowIndex++) {
    for (let colIndex = 0; colIndex < letters[rowIndex].length; colIndex++) {
      const letter = letters[rowIndex][colIndex];
      if (letter) {
        letterElements.push(
          <Letter
            key={`${piece.id}-${rowIndex}-${colIndex}`}
            pieceID={piece.id}
            letter={letter}
            pieceRowIndex={rowIndex}
            pieceColIndex={colIndex}
            overlapping={
              isOnBoard &&
              overlapGrid &&
              overlapGrid[(piece as PieceInBoard).boardTop + rowIndex][
                (piece as PieceInBoard).boardLeft + colIndex
              ] > 1
            }
            isHorizontallyValid={
              isOnBoard &&
              horizontalValidityGrid?.[
                (piece as PieceInBoard).boardTop + rowIndex
              ]?.[(piece as PieceInBoard).boardLeft + colIndex]
            }
            isVerticallyValid={
              isOnBoard &&
              verticalValidityGrid?.[
                (piece as PieceInBoard).boardTop + rowIndex
              ]?.[(piece as PieceInBoard).boardLeft + colIndex]
            }
            gameIsSolved={gameIsSolved}
            dispatchGameState={dispatchGameState}
          />,
        );
        borderElements.push(
          <LetterBorder
            key={`border-${piece.id}-${rowIndex}-${colIndex}`}
            rowIndex={rowIndex}
            colIndex={colIndex}
            border={{
              top: !letters[rowIndex - 1]?.[colIndex],
              bottom: !letters[rowIndex + 1]?.[colIndex],
              left: !letters[rowIndex][colIndex - 1],
              right: !letters[rowIndex][colIndex + 1],
            }}
          />,
        );
      }
    }
  }

  const layoutStyle: {gridRow: string; gridColumn: string} = {
    gridRow: "",
    gridColumn: "",
  };
  const nrows = letters.length;
  const ncols = letters[0].length;
  if (isOnBoard) {
    layoutStyle.gridRow = `${
      (piece as PieceInBoard).boardTop + 1
    } / span ${nrows}`;
    layoutStyle.gridColumn = `${
      (piece as PieceInBoard).boardLeft + 1
    } / span ${ncols}`;
  } else if (isDragging) {
    layoutStyle.gridRow = `${
      (piece as PieceInDrag).dragGroupTop + 1
    } / span ${nrows}`;
    layoutStyle.gridColumn = `${
      (piece as PieceInDrag).dragGroupLeft + 1
    } / span ${ncols}`;
  }

  return (
    <div
      id={`piece-${piece.id}`}
      className="piece"
      style={
        {
          "--grid-rows": `${letters.length}`,
          "--grid-columns": `${letters[0].length}`,
          ...layoutStyle,
        } as CSSPropertiesWithVars
      }
    >
      {letterElements}
      {borderElements}
    </div>
  );
}
