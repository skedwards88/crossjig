export type PieceWithoutLocation = {
  letters: LetterOrEmpty[][];
  id: number;
  solutionTop: number; // the vertical location of the top of the piece in the "official" solved puzzle
  solutionLeft: number; // the horizontal location of the left side of the piece in the "official" solved puzzle
};
export type PieceInPool = PieceWithoutLocation & {
  poolIndex: number; // The position of the piece in the pool. Undefined if the piece is on the board or being dragged.
  boardTop: undefined;
  boardLeft: undefined;
  dragGroupTop: undefined;
  dragGroupLeft: undefined;
};

export type PieceInBoard = PieceWithoutLocation & {
  poolIndex: undefined;
  boardTop: number; // The current vertical location of the top of the piece in the board. Undefined if the piece is in the pool or being dragged.
  boardLeft: number; // The current horizontal location of the left of the piece in the board. Undefined if the piece is in the pool or being dragged
  dragGroupTop: undefined;
  dragGroupLeft: undefined;
};

export type PieceInDrag = PieceWithoutLocation & {
  poolIndex: undefined;
  boardTop: undefined;
  boardLeft: undefined;
  dragGroupTop: number; // The vertical distance from the top of the piece to the top of the collection of pieces being dragged. Undefined if the piece is not being dragged.
  dragGroupLeft: number; // The horizontal distance from the left of the piece to the left of the collection of pieces being dragged. Undefined if the piece is not being dragged.
};

export type PieceInGame = PieceInPool | PieceInBoard | PieceInDrag;

export type Puzzle = {
  gridSize: number;
  pieces: PieceInGame[];
  maxShiftLeft: number;
  maxShiftRight: number;
  maxShiftUp: number;
  maxShiftDown: number;
};

export type Position = {
  x: number;
  y: number;
};

export type DragOrigin =
  | {
      where: "pool";
      index: number; // The starting index of the drag group in the pool
    }
  | {
      where: "board";
    };

export type DragDestinationPool = {
  where: "pool";
  index: number; // The starting index of the drag group in the pool
};

export type DragDestinationBoard = {
  where: "board";
  top: number; // The starting vertical location of the top of the drag group in the board.
  left: number; // The starting horizontal location of the left of the drag group in the board.
};

export type DragDestination = DragDestinationBoard | DragDestinationPool;

export type DragState = {
  pieceIDs: number[]; // The IDs of the pieces being dragged.
  boardIsShifting: boolean; // Whether the whole board is being dragged.
  dragHasMoved: boolean; // Whether the pointer has moved (ignoring some wiggle) since the drag started.
  pointerID: number; // The ID of the pointer, as captured by the pointer down event.
  // The x and y position of the pointer, as captured by the pointer down event.
  pointerStartPosition: Position;
  pointer: Position;
  // The distance between the pointer and the top left corner of the drag group:
  pointerOffset: Position;
  // Info about where the piece originated:
  origin: DragOrigin;
  // Info about where the pieces would be dropped, based on the position of the pointer:
  destination: DragDestination;
};

export type BaseGameState = {
  pieces: PieceInGame[];
  gridSize: number;
  dragCount: number;
  dragState?: DragState | undefined;
  seed: string;
  maxShiftLeft: number;
  maxShiftRight: number;
  maxShiftUp: number;
  maxShiftDown: number;
  numLetters: number;
  allPiecesAreUsed: boolean;
  gameIsSolved: boolean;
  gameIsSolvedReason: string;
  hintTally: number;
  isResumedFromSave: boolean;
  isCustomCreating?: false;
};

export type GameStateRandom = BaseGameState & {
  isCustom: false;
  isDaily: false;
  isAdventure: false;
};

export type GameStateDaily = BaseGameState & {
  stats: Stats;
  isCustom: false;
  isDaily: true;
  isAdventure: false;
};

export type GameStateCustom = BaseGameState & {
  isCustom: true;
  isDaily: false;
  isAdventure: false;
};

export type GameStateAdventure = BaseGameState & {
  isCustom: false;
  isDaily: false;
  isAdventure: true;
  currentLevel: number;
  totalHints: number;
  adventureComplete: boolean;
};

export type GameState =
  | GameStateRandom
  | GameStateDaily
  | GameStateCustom
  | GameStateAdventure;

export type Stats = {
  lastDateWon?: string | undefined;
  streak: number;
  maxStreak: number;
  numHintlessInStreak: number;
  numHintsInStreak: number;
  days: {
    0: {won: number; noHints: number};
    1: {won: number; noHints: number};
    2: {won: number; noHints: number};
    3: {won: number; noHints: number};
    4: {won: number; noHints: number};
    5: {won: number; noHints: number};
    6: {won: number; noHints: number};
  };
};

export type Letter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export type LetterOrEmpty = Letter | "";

export type DayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DisplayState =
  | "game"
  | "rules"
  | "heart"
  | "settings"
  | "daily"
  | "dailyStats"
  | "custom"
  | "customError"
  | "customShare"
  | "customLookup"
  | "moreGames"
  | "installOverview"
  | "pwaInstall"
  | "extendedMenu"
  | "adventure"
  | "whatsNew";

export type CSSPropertiesWithVars = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};
