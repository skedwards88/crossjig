import React from "react";
import Share from "@skedwards88/shared-components/src/components/Share";
import {assembleShareLink} from "@skedwards88/shared-components/src/logic/assembleShareLink";
import {useMetadataContext} from "@skedwards88/shared-components/src/components/MetadataContextProvider";

export default function GameOver({dispatchGameState, gameState, setDisplay}) {
  const {userId, sessionId} = useMetadataContext();

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
