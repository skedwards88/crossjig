import React from "react";
import packageJson from "../../package.json";

export default function Rules({setDisplay, setHasSeenWhatsNew}) {
  return (
    <div className="App rules">
      <h1 id="rulesHeader">Crossjig: How to play</h1>
      <video src="assets/demo-compressed.mp4" autoPlay loop muted playsInline id="rulesDemo"></video>

      <div id="rulesText">
        <p>
          <b>Drag</b> pieces to the board to make words vertically and
          horizontally.
        </p>
        <p>
          <b>Drag a blank space</b> to move the whole puzzle.
        </p>
        <p>
          <b>Long press and drag</b> to move a group of touching pieces.
        </p>
        <button
          id="rulesClose"
          className="close"
          onClick={() => {
            setDisplay("game");
            setHasSeenWhatsNew(true);
          }}
        >
          {"Go to puzzle"}
        </button>
        <hr></hr>
        <p>
          Click <span id="hintIcon" className="rulesIcon"></span> for a hint. A
          hint moves all pieces that are on the board to their correct location.
          If all pieces are already correct, a new piece is added to the board.
        </p>
        <p>
          Click <span id="settingsIcon" className="rulesIcon"></span> to change
          the number of pieces in the puzzle or the validity indication.
        </p>
        <p>
          Click <span id="calendarIconSolved" className="rulesIcon"></span> to
          play the daily challenge. The daily challenge is easiest on Monday and
          gets harder over the week.
        </p>
        <p>
          Click <span id="customIcon" className="rulesIcon"></span> to build
          your own crossjig to share with friends.
        </p>
      </div>
      <button
        id="rulesClose"
        className="close"
        onClick={() => {
          setDisplay("game");
          setHasSeenWhatsNew(true);
        }}
      >
        {"Go to puzzle"}
      </button>
      <small id="rulesVersion">version {packageJson.version}</small>
    </div>
  );
}
