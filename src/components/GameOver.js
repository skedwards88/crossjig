import React from "react";
import Share from "./Share";

export default function GameOver({ dispatchGameState, gameState }) {
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
        <Share text={"Check out this word puzzle!"}></Share>
    </div>
  );
}
