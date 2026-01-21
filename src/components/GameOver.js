import React from "react";
import Share from "@skedwards88/shared-components/src/components/Share";
import {assembleShareLink} from "@skedwards88/shared-components/src/logic/assembleShareLink";
import {useMetadataContext} from "@skedwards88/shared-components/src/components/MetadataContextProvider";
import {ADVENTURE_LEVELS} from "../logic/adventure";

export default function GameOver({dispatchGameState, gameState, setDisplay}) {
  const {userId, sessionId} = useMetadataContext();

  if (gameState.isAdventure) {
    const isLastLevel = gameState.currentLevel >= ADVENTURE_LEVELS.length - 1;
    return (
      <div id="gameOver">
        <div>Level {gameState.currentLevel + 1} Complete!</div>
        <button
          onClick={() => {
            dispatchGameState({action: "nextLevel"});
          }}
        >
          {isLastLevel ? "Finish Adventure" : `Continue to Level ${gameState.currentLevel + 2}`}
        </button>
      </div>
    );
  }

  if (gameState.isDaily) {
    return (
      <div id="gameOver">
        <div>Daily challenge solved!</div>
        <button
          onClick={() => {
            setDisplay("dailyStats");
          }}
        >
          View daily stats
        </button>
      </div>
    );
  }
  return (
    <div id="gameOver">
      <div>Complete!</div>
      <button
        onClick={() => {
          dispatchGameState({
            ...gameState,
            action: "newGame",
          });
        }}
      >
        New game
      </button>
      <Share
        origin={gameState.isCustom ? "custom game over" : "game over"}
        content="Share"
        appName="Crossjig"
        text={
          gameState.isCustom
            ? "Check out this custom crossjig!"
            : "Check out this crossjig!"
        }
        url={assembleShareLink({
          url: "https://crossjig.com",
          seed: gameState.isCustom
            ? `custom-${gameState.seed}`
            : `${gameState.seed}_${gameState.numLetters}`,
        })}
        userId={userId}
        sessionId={sessionId}
      ></Share>
    </div>
  );
}
