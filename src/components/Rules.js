import React from "react";
import packageJson from "../../package.json";

export default function Rules({ setDisplay }) {
  return (
    <div className="App rules">
      <h1 id="rulesHeader">Crossjig: How to play</h1>
      <p id="rulesText">{`Arrange the pieces to make words vertically and horizontally. All words must connect.\n\nDrag a blank space to move the whole puzzle.\n\nLong press and drag to move a group of touching pieces.`}</p>
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
