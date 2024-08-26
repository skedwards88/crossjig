import React from "react";

export default function MoreGames({setDisplay}) {
  return (
    <div className="App info">
      <div className="infoText">
        {`Want more games? Check out `}
        <a href="https://lexlet.com">Lexlet</a>
        {" and "}
        <a href="https://skedwards88.github.io/blobble/">Blobble</a>
        {" or see all of our puzzle games "}
        <a href="https://skedwards88.github.io/">here</a>
        {`. `}
      </div>
      <button className="close" onClick={() => setDisplay("game")}>
        Close
      </button>
    </div>
  );
}
