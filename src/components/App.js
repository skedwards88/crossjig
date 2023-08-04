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
import { gameInit } from "../logic/gameInit";
import { gameReducer } from "../logic/gameReducer";
import { gameSolvedQ } from "../logic/gameSolvedQ";

export default function App() {
  const [display, setDisplay] = React.useState("game");
  const [installPromptEvent, setInstallPromptEvent] = React.useState();
  const [showInstallButton, setShowInstallButton] = React.useState(true);
  const [gameState, dispatchGameState] = React.useReducer(
    gameReducer,
    {},
    gameInit
  );
  const [dailyGameState, dailyDispatchGameState] = React.useReducer(
    gameReducer,
    {isDaily: true},
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
    window.localStorage.setItem("crossjigState", JSON.stringify(gameState));
  }, [gameState]);

  React.useEffect(() => {
    window.localStorage.setItem(
      "dailyCrossjigState",
      JSON.stringify(dailyGameState)
    );
  }, [dailyGameState]);

  const { gameIsSolved: dailyIsSolved } = dailyGameState.pieces.filter(
    (piece) => piece.poolIndex >= 0
  ).length
    ? { gameIsSolved: false }
    : gameSolvedQ(dailyGameState.pieces, dailyGameState.gridSize);

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
      if (dailyIsSolved) {
        return (
          <Stats setDisplay={setDisplay} stats={dailyGameState.stats}></Stats>
        );
      } else {
        return (
          <div className="App" id="crossjig">
            <div id="exitDaily">
              <button
                id="helpButton"
                className="controlButton"
                // disabled={!gameState.pool.length} todo
                onClick={() => dailyDispatchGameState({ action: "getHint" })}
              ></button>
              <button onClick={() => setDisplay("game")}>
                Exit daily challenge
              </button>
            </div>
            <Game
              dispatchGameState={dailyDispatchGameState}
              gameState={dailyGameState}
            ></Game>
          </div>
        );
      }
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
            dailyIsSolved={dailyIsSolved}
          ></ControlBar>
          <Game
            dispatchGameState={dispatchGameState}
            gameState={gameState}
          ></Game>
        </div>
      );
  }
}
