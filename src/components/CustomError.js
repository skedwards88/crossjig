import React from "react";

export default function CustomError({
  invalidReason,
  dispatchCustomState,
  setDisplay,
}) {
  return (
    <div className="App customMessage">
      <div>{`Your custom crossjig isn't ready to play yet: \n\n${invalidReason}`}</div>
      <button
        onClick={() => {
          dispatchCustomState({
            action: "updateInvalidReason",
            invalidReason: "",
          });
          setDisplay("custom");
        }}
      >
        Ok
      </button>
    </div>
  );
}
