import {getFromStorage} from "@skedwards88/shared-components/src/logic/safeStorage";
import type {DragState, Letter, LetterOrEmpty} from "../Types";

export type CustomCreationState = {
  pieces: PieceInCustom[];
  gridSize: 12;
  dragCount: number;
  dragState?: DragState | undefined;
  // these fields are not present in GameState
  representativeString: string;
  invalidReason: string;
  isCustomCreating: true;
  // Unlike GameState, these fields are not present:
  // - seed
  // - maxShiftLeft
  // - maxShiftRight
  // - maxShiftUp
  // - maxShiftDown
  // - numLetters
  // - allPiecesAreUsed
  // - gameIsSolved
  // - gameIsSolvedReason
  // - hintTally
  // - isResumedFromSave
};

// Unlike a puzzle piece:
// - no solution top/left
// - letters is [] instead of [][]
export type PieceInCustomWithoutLocation = {
  letters: LetterOrEmpty[][];
  id: number;
};

export type PieceInCustomPool = PieceInCustomWithoutLocation & {
  poolIndex: number; // The position of the piece in the pool. Undefined if the piece is on the board or being dragged.
  boardTop: undefined;
  boardLeft: undefined;
  dragGroupTop: undefined;
  dragGroupLeft: undefined;
};

export type PieceInCustomBoard = PieceInCustomWithoutLocation & {
  poolIndex: undefined;
  boardTop: number; // The current vertical location of the top of the piece in the board. Undefined if the piece is in the pool or being dragged.
  boardLeft: number; // The current horizontal location of the left of the piece in the board. Undefined if the piece is in the pool or being dragged
  dragGroupTop: undefined;
  dragGroupLeft: undefined;
};

export type PieceInCustomDrag = PieceInCustomWithoutLocation & {
  poolIndex: undefined;
  boardTop: undefined;
  boardLeft: undefined;
  dragGroupTop: number; // The vertical distance from the top of the piece to the top of the collection of pieces being dragged. Undefined if the piece is not being dragged.
  dragGroupLeft: number; // The horizontal distance from the left of the piece to the left of the collection of pieces being dragged. Undefined if the piece is not being dragged.
};

export type PieceInCustom =
  | PieceInCustomPool
  | PieceInCustomBoard
  | PieceInCustomDrag;

export function customCreationInit({
  useSaved = true,
}: {
  useSaved?: boolean;
}): CustomCreationState {
  const savedState = useSaved
    ? getFromStorage<CustomCreationState>("crossjigCustomCreation")
    : undefined;

  if (savedState?.isCustomCreating) {
    return savedState;
  }

  const alphabet: Letter[] = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  const pieces: PieceInCustomPool[] = alphabet.map((letter, index) => {
    return {
      letters: [[letter]],
      boardTop: undefined,
      boardLeft: undefined,
      dragGroupTop: undefined,
      dragGroupLeft: undefined,
      id: index,
      poolIndex: index,
    };
  });

  return {
    pieces,
    gridSize: 12,
    dragCount: 0,
    representativeString: "",
    invalidReason: "",
    isCustomCreating: true,
  };
}
