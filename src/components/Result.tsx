import React from "react";
import GameOver from "./GameOver";

export default function Result({dispatchGameState, gameState, setDisplay}) {
  return (
    <div id="result">
      {gameState.gameIsSolved ? (
        <GameOver
          dispatchGameState={dispatchGameState}
          gameState={gameState}
          setDisplay={setDisplay}
        ></GameOver>
      ) : (
        gameState.gameIsSolvedReason
      )}
    </div>
  );
}
