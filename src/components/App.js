import React from "react";
import Game from "./Game";
import Heart from "./Heart";
import Rules from "./Rules";
import ExtendedMenu from "./ExtendedMenu";
import MoreGames from "@skedwards88/shared-components/src/components/MoreGames";
import Stats from "./Stats";
import CustomCreation from "./CustomCreation";
import CustomShare from "./CustomShare";
import ControlBar from "./ControlBar";
import InstallOverview from "@skedwards88/shared-components/src/components/InstallOverview";
import PWAInstall from "@skedwards88/shared-components/src/components/PWAInstall";
import Share from "@skedwards88/shared-components/src/components/Share";
import CustomError from "./CustomError";
import CustomLookup from "./CustomLookup";
import WhatsNew from "./WhatsNew";
import {
  handleAppInstalled,
  handleBeforeInstallPrompt,
} from "@skedwards88/shared-components/src/logic/handleInstall";
import {handleShare} from "@skedwards88/shared-components/src/logic/handleShare";
import Settings from "./Settings";
import {gameInit} from "../logic/gameInit";
import {customInit} from "../logic/customInit";
import {
  adventureInit,
  adventureReducer,
  ADVENTURE_LEVELS,
} from "../logic/adventure";
import getDailySeed from "../logic/getDailySeed";
import {getSeedFromDate} from "@skedwards88/shared-components/src/logic/getSeedFromDate";
import {gameReducer} from "../logic/gameReducer";
import {parseUrlQuery} from "../logic/parseUrlQuery";
import {getInitialState} from "../logic/getInitialState";
import {hasVisitedSince} from "@skedwards88/shared-components/src/logic/hasVisitedSince";
import {assembleShareLink} from "@skedwards88/shared-components/src/logic/assembleShareLink";
import {convertGridToRepresentativeString} from "../logic/convertGridToRepresentativeString";
import {getGridFromPieces} from "../logic/getGridFromPieces";
import {crosswordValidQ, pickRandomIntBetween} from "@skedwards88/word_logic";
import {trie} from "../logic/trie";
import {resizeGrid} from "../logic/resizeGrid";
import {sendAnalyticsCF} from "@skedwards88/shared-components/src/logic/sendAnalyticsCF";
import {useMetadataContext} from "@skedwards88/shared-components/src/components/MetadataContextProvider";
import {inferEventsToLog} from "../logic/inferEventsToLog";

export default function App() {
  // *****
  // Install handling setup
  // *****
  // Set up states that will be used by the handleAppInstalled and handleBeforeInstallPrompt listeners
  const [installPromptEvent, setInstallPromptEvent] = React.useState();
  const [showInstallButton, setShowInstallButton] = React.useState(true);

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
  // *****
  // End install handling setup
  // *****

  // If a query string was passed,
  // parse it to get the data to regenerate the game described by the query string
  const [isCustom, seed, numLetters] = parseUrlQuery();

  // Determine when the player last visited the game
  // This is used to determine whether to show the rules instead of the game
  const lastVisitedYYYYMMDD = JSON.parse(
    localStorage.getItem("crossjigLastVisited"),
  );
  const hasVisitedEver = hasVisitedSince(lastVisitedYYYYMMDD, "20240429");

  const savedHasSeenWhatsNew = JSON.parse(
    localStorage.getItem("crossjigHasSeenWhatsNew20240909"),
  );

  const [hasSeenWhatsNew, setHasSeenWhatsNew] = React.useState(
    savedHasSeenWhatsNew ?? false,
  );

  React.useEffect(() => {
    window.localStorage.setItem(
      "crossjigHasSeenWhatsNew20240909",
      JSON.stringify(hasSeenWhatsNew),
    );
  }, [hasSeenWhatsNew]);

  const [lastVisited] = React.useState(getSeedFromDate());
  React.useEffect(() => {
    window.localStorage.setItem(
      "crossjigLastVisited",
      JSON.stringify(lastVisited),
    );
  }, [lastVisited]);

  // Determine what view to show the user
  const savedDisplay = JSON.parse(localStorage.getItem("crossjigDisplay"));
  const [display, setDisplay] = React.useState(
    getInitialState(savedDisplay, hasVisitedEver, hasSeenWhatsNew, isCustom),
  );

  // Determine the opacity for the validity indicator
  const savedValidityOpacity =
    JSON.parse(localStorage.getItem("crossjigValidityOpacity")) ?? 0.15;
  const [validityOpacity, setValidityOpacity] =
    React.useState(savedValidityOpacity);

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

  const [adventureState, dispatchAdventureState] = React.useReducer(
    adventureReducer,
    {useSaved: true},
    adventureInit,
  );

  const [, setLastVisible] = React.useState(Date.now());

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
      setLastVisible(Date.now());
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
    window.localStorage.setItem("crossjigDisplay", JSON.stringify(display));
  }, [display]);

  React.useEffect(() => {
    window.localStorage.setItem(
      "crossjigValidityOpacity",
      JSON.stringify(validityOpacity),
    );
  }, [validityOpacity]);

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

  React.useEffect(() => {
    window.localStorage.setItem(
      "crossjigAdventureState",
      JSON.stringify(adventureState),
    );
  }, [adventureState]);

  const {userId, sessionId} = useMetadataContext();

  // Store the previous state so that we can infer which analytics events to send
  const previousGameStateRef = React.useRef(gameState);
  const previousDailyGameStateRef = React.useRef(dailyGameState);

  // Send analytics following reducer updates, if needed
  React.useEffect(() => {
    const previousState = previousGameStateRef.current;

    const analyticsToLog = inferEventsToLog(previousState, gameState);

    if (analyticsToLog.length) {
      sendAnalyticsCF({userId, sessionId, analyticsToLog});
    }

    previousGameStateRef.current = gameState;
  }, [gameState, sessionId, userId]);

  React.useEffect(() => {
    const previousState = previousDailyGameStateRef.current;

    const analyticsToLog = inferEventsToLog(previousState, dailyGameState);

    if (analyticsToLog.length) {
      sendAnalyticsCF({userId, sessionId, analyticsToLog});
    }

    previousDailyGameStateRef.current = dailyGameState;
  }, [dailyGameState, sessionId, userId]);

  switch (display) {
    case "rules":
      return (
        <Rules
          setDisplay={setDisplay}
          setHasSeenWhatsNew={setHasSeenWhatsNew}
        ></Rules>
      );

    case "heart":
      return <Heart setDisplay={setDisplay} repoName="crossjig" />;

    case "settings":
      return (
        <Settings
          setDisplay={setDisplay}
          dispatchGameState={dispatchGameState}
          gameState={gameState}
          setValidityOpacity={setValidityOpacity}
          originalValidityOpacity={validityOpacity}
        />
      );

    case "daily":
      // force reinitialize the daily state if the day has changed
      if (dailyGameState.seed != getDailySeed()[0]) {
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
              id="hintIcon"
              className="controlButton"
              disabled={dailyGameState.gameIsSolved}
              onClick={() => dailyDispatchGameState({action: "getHint"})}
            ></button>
            <button id="exitDailyIcon" onClick={() => setDisplay("game")}>
              Exit daily challenge
            </button>
          </div>
          <Game
            dispatchGameState={dailyDispatchGameState}
            gameState={dailyGameState}
            validityOpacity={validityOpacity}
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
              id="playIcon"
              className="controlButton"
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
            ></button>

            <Share
              id="shareIcon"
              className="controlButton"
              userId={userId}
              sessionId={sessionId}
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

                const fullUrl = assembleShareLink({
                  url: "https://crossjig.com",
                  seed: `custom-${representativeString}`,
                });

                // Share (or show the link if sharing is not supported)
                if (navigator.canShare) {
                  handleShare({
                    appName: "Crossjig",
                    text: "Try this custom crossjig that I created!",
                    url: fullUrl,
                    origin: "custom creation",
                  });
                } else {
                  dispatchCustomState({
                    action: "updateRepresentativeString",
                    representativeString,
                  });
                  setDisplay("customShare");
                }
              }}
            ></Share>

            <button
              id="hintIcon"
              className="controlButton"
              onClick={() => {
                setDisplay("customLookup");
              }}
            ></button>

            <button id="exitCustomButton" onClick={() => setDisplay("game")}>
              Exit creation
            </button>
          </div>
          <CustomCreation
            dispatchCustomState={dispatchCustomState}
            validityOpacity={validityOpacity}
            customState={customState}
            setDisplay={setDisplay}
          ></CustomCreation>
        </div>
      );

    case "customError":
      return (
        <CustomError
          invalidReason={customState.invalidReason}
          dispatchCustomState={dispatchCustomState}
          setDisplay={setDisplay}
        ></CustomError>
      );

    case "customShare":
      return (
        <CustomShare
          representativeString={customState.representativeString}
          dispatchCustomState={dispatchCustomState}
          setDisplay={setDisplay}
        ></CustomShare>
      );

    case "customLookup":
      return <CustomLookup setDisplay={setDisplay}></CustomLookup>;

    case "moreGames":
      return (
        <MoreGames
          setDisplay={setDisplay}
          games={["lexlet", "blobble", "wordfall", "gribbles", "logicGrid"]}
          googleLink={
            "https://play.google.com/store/apps/details?id=com.crossjig.twa&hl=en_US"
          }
          appleLink={"https://apps.apple.com/us/app/crossjig/id6749487838"}
        ></MoreGames>
      );

    case "installOverview":
      return (
        <InstallOverview
          setDisplay={setDisplay}
          setInstallPromptEvent={setInstallPromptEvent}
          showInstallButton={showInstallButton}
          installPromptEvent={installPromptEvent}
          googleAppLink={
            "https://play.google.com/store/apps/details?id=com.crossjig.twa&hl=en_US"
          }
          appleAppLink={"https://apps.apple.com/us/app/crossjig/id6749487838"}
          userId={userId}
          sessionId={sessionId}
        ></InstallOverview>
      );

    case "pwaInstall":
      return (
        <PWAInstall
          setDisplay={setDisplay}
          googleAppLink={
            "https://play.google.com/store/apps/details?id=com.crossjig.twa&hl=en_US"
          }
          appleAppLink={"https://apps.apple.com/us/app/crossjig/id6749487838"}
          pwaLink={"https://crossjig.com"}
        ></PWAInstall>
      );

    case "extendedMenu":
      return <ExtendedMenu setDisplay={setDisplay}></ExtendedMenu>;

    case "adventure":
      return (
        <div className="App" id="crossjig">
          <div id="adventureBar">
            <button
              id="hintIcon"
              className="controlButton"
              disabled={
                adventureState.gameIsSolved || adventureState.adventureComplete
              }
              onClick={() => dispatchAdventureState({action: "getHint"})}
            ></button>
            <span id="adventureLevel">
              Level {adventureState.currentLevel + 1} /{" "}
              {ADVENTURE_LEVELS.length}
            </span>
            <button id="exitAdventureIcon" onClick={() => setDisplay("game")}>
              Exit adventure
            </button>
          </div>
          {adventureState.adventureComplete ? (
            <div id="adventureComplete">
              <h1>🎉 Adventure Complete! 🎉</h1>
              <p>You solved all {ADVENTURE_LEVELS.length} puzzles!</p>
              <p>Total hints used: {adventureState.totalHints}</p>
              <button
                onClick={() => dispatchAdventureState({action: "newAdventure"})}
              >
                Start New Adventure
              </button>
              <button onClick={() => setDisplay("game")}>
                Return to Main Game
              </button>
            </div>
          ) : (
            <Game
              dispatchGameState={dispatchAdventureState}
              gameState={adventureState}
              validityOpacity={validityOpacity}
              setDisplay={setDisplay}
            ></Game>
          )}
        </div>
      );

    case "whatsNew":
      return (
        <WhatsNew
          setDisplay={setDisplay}
          setHasSeenWhatsNew={setHasSeenWhatsNew}
        ></WhatsNew>
      );

    default:
      return (
        <div className="App" id="crossjig">
          <ControlBar
            setDisplay={setDisplay}
            dispatchGameState={dispatchGameState}
            gameState={gameState}
            dailyIsSolved={dailyGameState.gameIsSolved}
          ></ControlBar>
          <Game
            dispatchGameState={dispatchGameState}
            gameState={gameState}
            validityOpacity={validityOpacity}
          ></Game>
        </div>
      );
  }
}
