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
  type BeforeInstallPromptEvent,
} from "@skedwards88/shared-components/src/logic/handleInstall";
import {handleShare} from "@skedwards88/shared-components/src/logic/handleShare";
import Settings from "./Settings";
import {gameInit} from "../logic/gameInit";
import {customCreationInit} from "../logic/customCreationInit";
import {adventureReducer, ADVENTURE_LEVELS} from "../logic/adventure";
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
import {
  getFromStorage,
  saveToStorage,
} from "@skedwards88/shared-components/src/logic/safeStorage";
import {type DisplayState} from "../Types";
import {dailyReducer} from "../logic/dailyReducer";

export default function App(): React.JSX.Element {
  // *****
  // Install handling setup
  // *****
  // Set up states that will be used by the handleAppInstalled and handleBeforeInstallPrompt listeners
  const [installPromptEvent, setInstallPromptEvent] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] =
    React.useState<boolean>(true);

  React.useEffect(() => {
    // Need to store the function in a variable so that
    // the add and remove actions can reference the same function
    const listener = (event: BeforeInstallPromptEvent): void =>
      handleBeforeInstallPrompt(
        event,
        setInstallPromptEvent,
        setShowInstallButton,
      );

    window.addEventListener("beforeinstallprompt", listener);

    return (): void =>
      window.removeEventListener("beforeinstallprompt", listener);
  }, []);

  React.useEffect(() => {
    // Need to store the function in a variable so that
    // the add and remove actions can reference the same function
    const listener = (): void =>
      handleAppInstalled(setInstallPromptEvent, setShowInstallButton);

    window.addEventListener("appinstalled", listener);

    return (): void => window.removeEventListener("appinstalled", listener);
  }, []);
  // *****
  // End install handling setup
  // *****

  // If a query string was passed,
  // parse it to get the data to regenerate the game described by the query string
  const {isCustom, seed, numLetters} = parseUrlQuery();

  // Determine when the player last visited the game
  // This is used to determine whether to show the rules instead of the game
  const lastVisitedYYYYMMDD = getFromStorage<string>("crossjigLastVisited");
  const hasVisitedEver = hasVisitedSince(lastVisitedYYYYMMDD, "20240429");

  const savedHasSeenWhatsNew = getFromStorage<boolean>(
    "crossjigHasSeenWhatsNew20240909",
  );

  const [hasSeenWhatsNew, setHasSeenWhatsNew] = React.useState<boolean>(
    savedHasSeenWhatsNew ?? false,
  );

  React.useEffect(() => {
    saveToStorage("crossjigHasSeenWhatsNew20240909", hasSeenWhatsNew);
  }, [hasSeenWhatsNew]);

  const [lastVisited] = React.useState<string>(getSeedFromDate());
  React.useEffect(() => {
    saveToStorage("crossjigLastVisited", lastVisited);
  }, [lastVisited]);

  // Determine what view to show the user
  const savedDisplay = getFromStorage<DisplayState>("crossjigDisplay");
  const [display, setDisplay] = React.useState<DisplayState>(
    getInitialState(savedDisplay, hasVisitedEver, hasSeenWhatsNew, isCustom),
  );

  // Determine the opacity for the validity indicator
  const savedValidityOpacity =
    getFromStorage<number>("crossjigValidityOpacity") ?? 0.15;
  const [validityOpacity, setValidityOpacity] =
    React.useState<number>(savedValidityOpacity);

  const [gameState, dispatchGameState] = React.useReducer(
    gameReducer,
    isCustom
      ? ({isCustom: true, seed, numLetters} as const)
      : ({seed, numLetters, isCustom: false} as const),
    (arg) => (arg.isCustom ? gameInit(arg) : gameInit(arg)), // yes these branches take the same action. This grossness is required for ts to correctly resolve the overloads; the other options I found felt even messier
  );

  const [dailyGameState, dailyDispatchGameState] = React.useReducer(
    dailyReducer,
    {isDaily: true} as const,
    (arg) => gameInit(arg), // this syntax (instead of just gameInit) is required for TS to correctly interpret the overloads
  );

  const [customCreationState, dispatchCustomCreationState] = React.useReducer(
    gameReducer,
    {},
    customCreationInit,
  );

  const [adventureState, dispatchAdventureState] = React.useReducer(
    adventureReducer,
    {isAdventure: true} as const,
    (arg) => gameInit(arg), // this syntax (instead of just gameInit) is required for TS to correctly interpret the overloads
  );

  const [, setLastVisible] = React.useState<number>(Date.now());

  function handleCustomGeneration(): string {
    // If there is nothing to share, display a message with errors
    if (
      !customCreationState.pieces.some((piece) => piece.boardTop === undefined)
    ) {
      throw new Error("Add some letters to the board first!");
    }

    // Validate the grid
    // - The UI restricts the grid size, so don't need to validate that
    // - Make sure all letters are connected
    // - Make sure all horizontal and vertical words are known
    const grid = getGridFromPieces({
      pieces: customCreationState.pieces,
      gridSize: customCreationState.gridSize,
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

  function handleVisibilityChange(): void {
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

    return (): void => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  React.useEffect(() => {
    saveToStorage("crossjigDisplay", display);
  }, [display]);

  React.useEffect(() => {
    saveToStorage("crossjigValidityOpacity", validityOpacity);
  }, [validityOpacity]);

  React.useEffect(() => {
    saveToStorage("crossjigState", gameState);
  }, [gameState]);

  React.useEffect(() => {
    saveToStorage("dailyCrossjigState", dailyGameState);
  }, [dailyGameState]);

  React.useEffect(() => {
    saveToStorage("crossjigCustomCreation", customCreationState);
  }, [customCreationState]);

  React.useEffect(() => {
    saveToStorage("crossjigAdventureState", adventureState);
  }, [adventureState]);

  const {userId, sessionId} = useMetadataContext();

  // Store the previous state so that we can infer which analytics events to send
  const previousGameStateRef = React.useRef(gameState);
  const previousDailyGameStateRef = React.useRef(dailyGameState);
  const previousAdventureStateRef = React.useRef(adventureState);

  const isFirstRenderRef = React.useRef(true);
  const isFirstDailyRenderRef = React.useRef(true);
  const isFirstAdventureRenderRef = React.useRef(true);

  // Send analytics following reducer updates, if needed
  React.useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      if (!gameState.isResumedFromSave) {
        sendAnalyticsCF({
          userId,
          sessionId,
          analyticsToLog: [
            {
              eventName: "new_game",
              eventInfo: {
                isDaily: gameState.isDaily,
                isCustom: gameState.isCustom,
                isAdventure: gameState.isAdventure,
                numLetters: gameState.numLetters,
              },
            },
          ],
        });
        return;
      }
    }

    const previousState = previousGameStateRef.current;

    const analyticsToLog = inferEventsToLog(previousState, gameState);

    if (analyticsToLog.length) {
      sendAnalyticsCF({userId, sessionId, analyticsToLog});
    }

    previousGameStateRef.current = gameState;
  }, [gameState, sessionId, userId]);

  React.useEffect(() => {
    if (isFirstDailyRenderRef.current) {
      isFirstDailyRenderRef.current = false;
      if (!dailyGameState.isResumedFromSave) {
        sendAnalyticsCF({
          userId,
          sessionId,
          analyticsToLog: [
            {
              eventName: "new_game",
              eventInfo: {
                isDaily: dailyGameState.isDaily,
                isCustom: dailyGameState.isCustom,
                isAdventure: dailyGameState.isAdventure,
                numLetters: dailyGameState.numLetters,
              },
            },
          ],
        });
        return;
      }
    }

    const previousState = previousDailyGameStateRef.current;

    const analyticsToLog = inferEventsToLog(previousState, dailyGameState);

    if (analyticsToLog.length) {
      sendAnalyticsCF({userId, sessionId, analyticsToLog});
    }

    previousDailyGameStateRef.current = dailyGameState;
  }, [dailyGameState, sessionId, userId]);

  React.useEffect(() => {
    if (isFirstAdventureRenderRef.current) {
      isFirstAdventureRenderRef.current = false;
      if (!adventureState.isResumedFromSave) {
        sendAnalyticsCF({
          userId,
          sessionId,
          analyticsToLog: [
            {
              eventName: "new_game",
              eventInfo: {
                isDaily: adventureState.isDaily,
                isCustom: adventureState.isCustom,
                isAdventure: adventureState.isAdventure,
                numLetters: adventureState.numLetters,
              },
            },
          ],
        });
        return;
      }
    }

    const previousState = previousAdventureStateRef.current;

    const analyticsToLog = inferEventsToLog(previousState, adventureState);

    if (analyticsToLog.length) {
      sendAnalyticsCF({userId, sessionId, analyticsToLog});
    }

    previousAdventureStateRef.current = adventureState;
  }, [adventureState, sessionId, userId]);

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
                  // ts doesn't let you type the thing caught from error, hence this syntax:
                  const invalidReason =
                    error instanceof Error ? error.message : String(error);
                  dispatchCustomCreationState({
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
              onClick={() => {
                let representativeString;
                try {
                  representativeString = handleCustomGeneration();
                } catch (error) {
                  // ts doesn't let you type the thing caught from error, hence this syntax:
                  const invalidReason =
                    error instanceof Error ? error.message : String(error);
                  dispatchCustomCreationState({
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
                if ("canShare" in navigator) {
                  handleShare({
                    appName: "Crossjig",
                    text: "Try this custom crossjig that I created!",
                    url: fullUrl,
                    origin: "custom creation",
                    userId: userId,
                    sessionId: sessionId,
                  });
                } else {
                  dispatchCustomCreationState({
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
            dispatchCustomState={dispatchCustomCreationState}
            validityOpacity={validityOpacity}
            customState={customCreationState}
            setDisplay={setDisplay}
          ></CustomCreation>
        </div>
      );

    case "customError":
      return (
        <CustomError
          invalidReason={customCreationState.invalidReason}
          dispatchCustomState={dispatchCustomCreationState}
          setDisplay={setDisplay}
        ></CustomError>
      );

    case "customShare":
      return (
        <CustomShare
          representativeString={customCreationState.representativeString}
          dispatchCustomState={dispatchCustomCreationState}
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
          userId={userId}
          sessionId={sessionId}
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
              <h1>Adventure Complete!</h1>
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
            dailyDispatchGameState={dailyDispatchGameState}
            gameState={gameState}
            dailyIsSolved={dailyGameState.gameIsSolved}
          ></ControlBar>
          <Game
            dispatchGameState={dispatchGameState}
            gameState={gameState}
            validityOpacity={validityOpacity}
            setDisplay={setDisplay}
          ></Game>
        </div>
      );
  }
}
