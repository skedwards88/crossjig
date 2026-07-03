import React from "react";

export default function WhatsNew({setDisplay, setHasSeenWhatsNew}) {
  return (
    <div className="App info">
      <div id="rulesText">
        <p>You can now create and share custom crossjigs!</p>
        <p>
          Click{" "}
          <button
            id="customIcon"
            className="rulesIcon"
            onClick={() => {
              setDisplay("custom");
              setHasSeenWhatsNew(true);
            }}
          ></button>{" "}
          to build your own crossjig to share with friends.
        </p>
      </div>
      <button
        onClick={() => {
          setDisplay("game");
          setHasSeenWhatsNew(true);
        }}
      >
        {"Back to game"}
      </button>
    </div>
  );
}
