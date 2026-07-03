import React from "react";

export default function CustomShare({
  representativeString,
  dispatchCustomState,
  setDisplay,
}) {
  const link = `https://crossjig.com?id=custom-${representativeString}`;

  return (
    <div className="App customMessage">
      <div>{`Share your custom puzzle with this link!`}</div>
      <a href={link}>{link}</a>
      <div id="custom-message-buttons">
        <button
          onClick={() => {
            try {
              navigator.clipboard.writeText(link);
            } catch (error) {
              console.log("Error copying", error);
            }
          }}
        >
          Copy
        </button>
        <button
          onClick={() => {
            dispatchCustomState({
              action: "updateRepresentativeString",
              representativeString: "",
            });
            setDisplay("custom");
          }}
        >
          Ok
        </button>
      </div>
    </div>
  );
}
