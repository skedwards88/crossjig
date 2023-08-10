import React from "react";
import Game from "./Game";
import Heart from "./Heart";
import Rules from "./Rules";
import Stats from "./Stats";
import ControlBar from "./ControlBar";
import {
  handleAppInstalled,
  handleBeforeInstallPrompt,
} from "../common/handleInstall";
import Settings from "./Settings";
import { gameInit, getDailySeed } from "../logic/gameInit";
import { gameReducer } from "../logic/gameReducer";

export default function App() {
  const searchParams = new URLSearchParams(document.location.search);
  const seedQuery = searchParams.get("puzzle");

  const savedDisplay = JSON.parse(localStorage.getItem("crossjigDisplay"));
  const [display, setDisplay] = React.useState(
    savedDisplay === "game" || savedDisplay === "daily" ? savedDisplay : "game"
  );

  const [installPromptEvent, setInstallPromptEvent] = React.useState();
  const [showInstallButton, setShowInstallButton] = React.useState(true);
  const [gameState, dispatchGameState] = React.useReducer(
    gameReducer,
    {
      seed: seedQuery,
    },
    gameInit
  );
  let [dailyGameState, dailyDispatchGameState] = React.useReducer(
    gameReducer,
    { isDaily: true },
    gameInit
  );

  React.useEffect(() => {
    window.addEventListener("beforeinstallprompt", (event) =>
      handleBeforeInstallPrompt(
        event,
        setInstallPromptEvent,
        setShowInstallButton
      )
    );
    return () =>
      window.removeEventListener("beforeinstallprompt", (event) =>
        handleBeforeInstallPrompt(
          event,
          setInstallPromptEvent,
          setShowInstallButton
        )
      );
  }, []);

  React.useEffect(() => {
    window.addEventListener("appinstalled", () =>
      handleAppInstalled(setInstallPromptEvent, setShowInstallButton)
    );
    return () => window.removeEventListener("appinstalled", handleAppInstalled);
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem("crossjigDisplay", JSON.stringify(display));
  }, [display]);

  React.useEffect(() => {
    window.localStorage.setItem("crossjigState", JSON.stringify(gameState));
  }, [gameState]);

  React.useEffect(() => {
    window.localStorage.setItem(
      "dailyCrossjigState",
      JSON.stringify(dailyGameState)
    );
  }, [dailyGameState]);

  switch (display) {
    case "rules":
      return <Rules setDisplay={setDisplay}></Rules>;

    case "heart":
      return <Heart setDisplay={setDisplay}></Heart>;

    case "settings":
      return (
        <Settings
          setDisplay={setDisplay}
          dispatchGameState={dispatchGameState}
          gameState={gameState}
        />
      );

    case "daily":
      // force reinitialize the daily state if the day has changed
      if (dailyGameState.seed != getDailySeed()) {
        dailyGameState = gameInit({ isDaily: true, useSaved: false });
      }
      return (
        <div className="App" id="crossjig">
          <div id="exitDaily">
            <button
              id="helpButton"
              className="controlButton"
              disabled={dailyGameState.gameIsSolved}
              onClick={() => dailyDispatchGameState({ action: "getHint" })}
            ></button>
            <button id="exitDailyButton" onClick={() => setDisplay("game")}>
              Exit daily challenge
            </button>
          </div>
          <Game
            dispatchGameState={dailyDispatchGameState}
            gameState={dailyGameState}
            setDisplay={setDisplay}
          ></Game>
        </div>
      );

    case "dailyStats":
      return (
        <Stats setDisplay={setDisplay} stats={dailyGameState.stats}></Stats>
      );

    default:
      return (
        <div className="App" id="crossjig">
          <ControlBar
            setDisplay={setDisplay}
            setInstallPromptEvent={setInstallPromptEvent}
            showInstallButton={showInstallButton}
            installPromptEvent={installPromptEvent}
            dispatchGameState={dispatchGameState}
            gameState={gameState}
            dailyIsSolved={dailyGameState.gameIsSolved}
          ></ControlBar>
          <Game
            dispatchGameState={dispatchGameState}
            gameState={gameState}
          ></Game>
        </div>
      );
  }
}
