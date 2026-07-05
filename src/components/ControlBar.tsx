import Share from "@skedwards88/shared-components/src/components/Share";
import {useMetadataContext} from "@skedwards88/shared-components/src/components/MetadataContextProvider";
import type {DisplayState, GameState} from "../Types";
import type {GameReducerPayload} from "../logic/gameReducer";

export default function ControlBar({
  dispatchGameState,
  dailyDispatchGameState,
  gameState,
  setDisplay,
  dailyIsSolved,
}: {
  dispatchGameState: React.Dispatch<GameReducerPayload>;
  dailyDispatchGameState: React.Dispatch<GameReducerPayload>;
  gameState: GameState;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
  dailyIsSolved: boolean;
}): React.JSX.Element {
  const {userId, sessionId} = useMetadataContext();

  return (
    <div id="controls">
      <button
        id="newGameIcon"
        className="controlButton"
        onClick={() => {
          dispatchGameState({
            action: "newGame",
            numLetters: gameState.numLetters,
          });
        }}
      ></button>

      <button
        id="hintIcon"
        className="controlButton"
        disabled={gameState.gameIsSolved}
        onClick={() => dispatchGameState({action: "getHint"})}
      ></button>

      {dailyIsSolved ? (
        <button
          id="calendarIconSolved"
          className="controlButton"
          onClick={() => {
            dailyDispatchGameState({action: "clearStreakIfNeeded"});
            setDisplay("daily");
          }}
        ></button>
      ) : (
        <button
          id="calendarIcon"
          className="controlButton"
          onClick={() => setDisplay("daily")}
        ></button>
      )}

      <button
        id="settingsIcon"
        className="controlButton"
        onClick={() => setDisplay("settings")}
      ></button>

      <button
        id="heartIcon"
        className="controlButton"
        onClick={() => setDisplay("moreGames")}
      ></button>

      <Share
        id="shareIcon"
        className="controlButton"
        appName="Crossjig"
        text="Check out this word puzzle!"
        url="https://crossjig.com"
        origin="control bar"
        userId={userId}
        sessionId={sessionId}
      ></Share>

      <button
        id="menuIcon"
        className="controlButton"
        onClick={() => setDisplay("extendedMenu")}
      ></button>
    </div>
  );
}
