import sendAnalytics from "../common/sendAnalytics";
import {updatePieceDatum} from "./assemblePiece";

export function customInit(useSaved = true) {
  const savedState = useSaved
    ? JSON.parse(localStorage.getItem("crossjigCustomCreation"))
    : undefined;

  if (savedState && savedState.isCustomCreating) {
    return savedState;
  }

  const alphabet = [
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

  const pieces = alphabet.map((letter, index) =>
    updatePieceDatum({
      letters: [letter],
      solutionTop: undefined,
      solutionLeft: undefined,
      boardTop: undefined,
      boardLeft: undefined,
      id: index,
      poolIndex: index,
    }),
  );

  sendAnalytics("new_custom");

  return {
    pieces,
    gridSize: 12,
    dragCount: 0,
    dragState: undefined,
    representativeString: "",
    invalidReason: "",
    isCustomCreating: true,
  };
}
