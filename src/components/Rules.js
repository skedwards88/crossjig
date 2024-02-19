import React from "react";
import packageJson from "../../package.json";

export default function Rules({setDisplay}) {
  return (
    <div className="App rules">
      <h1 id="rulesHeader">Crossjig: How to play</h1>
      <p id="rulesText">
        <b>Drag</b> the pieces to the board to make words vertically and
        horizontally. All words must connect.
        <br />
        <br />
        <b>Drag a blank space</b> to move the whole puzzle.
        <br />
        <br />
        <b>Long press and drag</b> to move a group of touching pieces.
        <br />
        <br />
        Click the <b>magnifying glass</b> to get a hint. A hint will move all
        pieces that are on the board to their correct location. If all pieces
        are already in the correct location, a new piece will be added to the
        board.
        <br />
        <br />
        Click the <b>gear</b> to change the number of pieces in the puzzle.
        <br />
        <br />
        Click the <b>calendar</b> to play the daily challenge. The daily
        challenge is easiest on Monday and gets harder over the week.
        <br />
        <br />
      </p>
      <button
        id="rulesClose"
        className="close"
        onClick={() => {
          setDisplay("game");
        }}
      >
        {"Play"}
      </button>
      <small id="rulesVersion">version {packageJson.version}</small>
    </div>
  );
}
