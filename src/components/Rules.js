import React from "react";
import packageJson from "../../package.json";

export default function Rules({ setDisplay }) {
  return (
    <div className="App rules">
      <h1 id="rulesHeader">Crossjig: How to play</h1>
      <p id="rulesText">{`Arrange the pieces to make words vertically and horizontally. All words must connect.\n\nDrag a blank space to move the whole puzzle.\n\nLong press and drag to move a group of touching pieces.\n\nClick the magnifying glass to get a hint. A hint will move all pieces that are on the board to their correct location. If all pieces are already in the correct location, a new piece will be added to the board.\n\nClick the gear to change the number of pieces in the puzzle.\n\nClick the calendar to play the daily challenge. The daily challenge is easiest on Monday and gets harder over the week.`}</p>
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
