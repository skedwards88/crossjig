import {GameReducerPayload} from "../logic/gameReducer";
import {DisplayState} from "../Types";

export default function CustomShare({
  representativeString,
  dispatchCustomState,
  setDisplay,
}: {
  representativeString: string;
  dispatchCustomState: React.Dispatch<GameReducerPayload>;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
}): React.JSX.Element {
  const link = `https://crossjig.com?id=custom-${representativeString}`;

  return (
    <div className="App customMessage">
      <div>{`Share your custom puzzle with this link!`}</div>
      <a href={link}>{link}</a>
      <div id="custom-message-buttons">
        <button
          onClick={() => {
            try {
              navigator.clipboard.writeText(link);
            } catch (error) {
              console.log("Error copying", error);
            }
          }}
        >
          Copy
        </button>
        <button
          onClick={() => {
            dispatchCustomState({
              action: "updateRepresentativeString",
              representativeString: "",
            });
            setDisplay("custom");
          }}
        >
          Ok
        </button>
      </div>
    </div>
  );
}
