import type {GameReducerPayload} from "../logic/gameReducer";
import type {DisplayState} from "../Types";

export default function CustomError({
  invalidReason,
  dispatchCustomState,
  setDisplay,
}: {
  invalidReason: string;
  dispatchCustomState: React.Dispatch<GameReducerPayload>;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
}): React.JSX.Element {
  return (
    <div className="App customMessage">
      <div>{`Your custom crossjig isn't ready to play yet: \n\n${invalidReason}`}</div>
      <button
        onClick={() => {
          dispatchCustomState({
            action: "updateInvalidReason",
            invalidReason: "",
          });
          setDisplay("custom");
        }}
      >
        Ok
      </button>
    </div>
  );
}
