import React from "react";

export default function MoreGames({setDisplay}) {
  // To add a new game:
  // - add it to the list here
  // - add a screenshot under images/moreGames
  // - reference the screenshot in src/styles/MoreGames.css
  const games = {
    lexlet: "https://lexlet.com",
    blobble: "https://skedwards88.github.io/blobble/",
    wordfall: "https://skedwards88.github.io/wordfall/",
    gribbles: "https://skedwards88.github.io/gribbles/",
    logicGrid: "https://skedwards88.github.io/logic-grid/",
  };

  const gameElements = Object.keys(games).map((game, index) => (
    <a
      key={index}
      href={games[game]}
      className={`game-image ${game}`}
      role="img"
      aria-label={`Screenshot of the ${game} game.`}
    ></a>
  ));

  return (
    <div className="App info">
      <div className="infoText">
        {`Want more games? Check these out, or see all of our puzzle games `}
        <a href="https://skedwards88.github.io/">here</a>
        {`. `}

        <div id="moreGames">{gameElements}</div>
      </div>
      <button className="close" onClick={() => setDisplay("game")}>
        Close
      </button>
    </div>
  );
}
