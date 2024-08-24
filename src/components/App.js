import React from "react";
import Game from "./Game";
import Heart from "./Heart";
import Rules from "./Rules";
import Stats from "./Stats";
import CustomCreation from "./CustomCreation";
import CustomShare from "./CustomShare";
import ControlBar from "./ControlBar";
import {
  handleAppInstalled,
  handleBeforeInstallPrompt,
} from "../common/handleInstall";
import Settings from "./Settings";
import {gameInit} from "../logic/gameInit";
import {customInit} from "../logic/customInit";
import getDailySeed from "../common/getDailySeed";
import {gameReducer} from "../logic/gameReducer";
import {parseUrlQuery} from "../logic/parseUrlQuery";
import {getInitialState} from "../common/getInitialState";
import {hasVisitedSince} from "../common/hasVisitedSince";
import {handleShare} from "../common/handleShare";
import {convertGridToRepresentativeString} from "../logic/convertGridToRepresentativeString";
import {getGridFromPieces} from "../logic/getGridFromPieces";
import {crosswordValidQ, pickRandomIntBetween} from "@skedwards88/word_logic";
import {trie} from "../logic/trie";
import {resizeGrid} from "../logic/resizeGrid";

export default function App() {
  // If a query string was passed,
  // parse it to get the data to regenerate the game described by the query string
  const [isCustom, seed, numLetters] = parseUrlQuery();

  // Determine when the player last visited the game
  // This is used to determine whether to show the rules or an announcement instead of the game
  const hasVisited = hasVisitedSince("crossjigLastVisited", "20240429");
  const [lastVisited] = React.useState(getDailySeed());
  React.useEffect(() => {
    window.localStorage.setItem(
      "crossjigLastVisited",
      JSON.stringify(lastVisited),
    );
  }, [lastVisited]);

  // Determine what view to show the user
  const savedDisplay = JSON.parse(localStorage.getItem("crossjigDisplay"));
  const [display, setDisplay] = React.useState(
    getInitialState(savedDisplay, hasVisited),
  );

  // Set up states that will be used by the handleAppInstalled and handleBeforeInstallPrompt listeners
  const [installPromptEvent, setInstallPromptEvent] = React.useState();
  const [showInstallButton, setShowInstallButton] = React.useState(true);

  const [gameState, dispatchGameState] = React.useReducer(
    gameReducer,
    {
      seed,
      numLetters,
      isCustom,
    },
    gameInit,
  );

  let [dailyGameState, dailyDispatchGameState] = React.useReducer(
    gameReducer,
    {isDaily: true},
    gameInit,
  );

  const [customState, dispatchCustomState] = React.useReducer(
    gameReducer,
    {},
    customInit,
  );

  // todo consolidate lastVisited and setLastOpened?
  const [, setLastOpened] = React.useState(Date.now());

  function handleCustomGeneration() {
    // If there is nothing to share, display a message with errors
    if (!customState.pieces.some((piece) => piece.boardTop >= 0)) {
      throw new Error("Add some letters to the board first!");
    }

    // Validate the grid
    // - The UI restricts the grid size, so don't need to validate that
    // - Make sure all letters are connected
    // - Make sure all horizontal and vertical words are known
    const grid = getGridFromPieces({
      pieces: customState.pieces,
      gridSize: customState.gridSize,
      solution: false,
    });

    const {gameIsSolved, reason} = crosswordValidQ({
      grid: grid,
      trie: trie,
    });

    // If the board is not valid, display a message with errors
    if (!gameIsSolved) {
      throw new Error(reason);
    }

    // Center and resize/pad the grid
    // Convert the grid to a representative string
    const resizedGrid = resizeGrid(grid);
    const cipherShift = pickRandomIntBetween(5, 9);
    const representativeString = convertGridToRepresentativeString(
      resizedGrid,
      cipherShift,
    );

    return representativeString;
  }

  function handleVisibilityChange() {
    // If the visibility of the app changes to become visible,
    // update the state to force the app to re-render.
    // This is to help the daily challenge refresh if the app has
    // been open in the background since an earlier challenge.
    if (!document.hidden) {
      setLastOpened(Date.now());
    }
  }

  React.useEffect(() => {
    // When the component is mounted, attach the visibility change event listener
    // (and remove the event listener when the component is unmounted).
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  React.useEffect(() => {
    // Need to store the function in a variable so that
    // the add and remove actions can reference the same function
    const listener = (event) =>
      handleBeforeInstallPrompt(
        event,
        setInstallPromptEvent,
        setShowInstallButton,
      );

    window.addEventListener("beforeinstallprompt", listener);
    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);

  React.useEffect(() => {
    // Need to store the function in a variable so that
    // the add and remove actions can reference the same function
    const listener = () =>
      handleAppInstalled(setInstallPromptEvent, setShowInstallButton);

    window.addEventListener("appinstalled", listener);
    return () => window.removeEventListener("appinstalled", listener);
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
      JSON.stringify(dailyGameState),
    );
  }, [dailyGameState]);

  React.useEffect(() => {
    window.localStorage.setItem(
      "crossjigCustomCreation",
      JSON.stringify(customState),
    );
  }, [customState]);

  switch (display) {
    case "rules":
      return <Rules setDisplay={setDisplay}></Rules>;

    case "heart":
      return (
        <Heart
          setDisplay={setDisplay}
          appName="Crossjig"
          shareText="Check out this word puzzle!"
          repoName="crossjig"
          url="https://crossjig.com"
        />
      );

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
        dailyDispatchGameState({
          action: "newGame",
          isDaily: true,
          useSaved: false,
        });
      }
      return (
        <div className="App" id="crossjig">
          <div id="exitDaily">
            <button
              id="helpButton"
              className="controlButton"
              disabled={dailyGameState.gameIsSolved}
              onClick={() => dailyDispatchGameState({action: "getHint"})}
            ></button>
            <button id="exitDailyButton" onClick={() => setDisplay("game")}>
              Exit daily challenge
            </button>
          </div>
          <Game
            dispatchGameState={dailyDispatchGameState}
            gameState={{
              ...dailyGameState,
              // todo in the settings, pass in the dailyDispatcher too and update the validityOpacity in the daily state as well. then remove this line.
              validityOpacity: gameState.validityOpacity,
            }}
            setDisplay={setDisplay}
          ></Game>
        </div>
      );

    case "dailyStats":
      return (
        <Stats setDisplay={setDisplay} stats={dailyGameState.stats}></Stats>
      );

    case "custom":
      return (
        <div className="App" id="crossjig">
          <div id="controls">
            <button
              id="playCustomButton"
              onClick={() => {
                let representativeString;
                try {
                  representativeString = handleCustomGeneration();
                } catch (error) {
                  const invalidReason = error.message;
                  dispatchCustomState({
                    action: "updateInvalidReason",
                    invalidReason: invalidReason,
                  });
                  setDisplay("customError");
                  return;
                }

                dispatchGameState({
                  action: "playCustom",
                  representativeString,
                });
                setDisplay("game");
              }}
            >
              Play
            </button>
            <button
              id="shareCustomButton"
              onClick={() => {
                let representativeString;
                try {
                  representativeString = handleCustomGeneration();
                } catch (error) {
                  const invalidReason = error.message;
                  dispatchCustomState({
                    action: "updateInvalidReason",
                    invalidReason: invalidReason,
                  });
                  setDisplay("customError");
                  return;
                }

                // Share (or show the link if sharing is not supported)
                if (navigator.canShare) {
                  handleShare({
                    appName: "Crossjig",
                    text: "Try this custom crossjig that I created!",
                    url: "https://crossjig.com",
                    representativeString,
                  });
                } else {
                  dispatchCustomState({
                    action: "updateRepresentativeString",
                    representativeString,
                  });
                  setDisplay("customShare");
                }
              }}
            >
              Share
            </button>
            <button id="exitCustomButton" onClick={() => setDisplay("game")}>
              Cancel
            </button>
          </div>
          <CustomCreation
            dispatchCustomState={dispatchCustomState}
            validityOpacity={gameState.validityOpacity}
            customState={customState}
            setDisplay={setDisplay}
          ></CustomCreation>
        </div>
      );

    case "customError":
      return (
        <div className="App customMessage">
          <div>{`Your game isn't ready to share yet: \n\n${customState.invalidReason}`}</div>
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

    case "customShare":
      return (
        <CustomShare
          representativeString={customState.representativeString}
          dispatchCustomState={dispatchCustomState}
          setDisplay={setDisplay}
        ></CustomShare>
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
