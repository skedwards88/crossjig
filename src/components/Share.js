import React from "react";
import sendAnalytics from "../common/sendAnalytics";

function handleShare({text, fullUrl}) {
  navigator
    .share({
      title: "Crossjig",
      text: `${text}\n\n`,
      url: fullUrl,
    })
    .then(() => console.log("Successful share"))
    .catch((error) => {
      console.log("Error sharing", error);
    });
  sendAnalytics("share");
}

function handleCopy({text, fullUrl}) {
  try {
    navigator.clipboard.writeText(`${text}\n\n${fullUrl}`);
  } catch (error) {
    console.log("Error copying", error);
  }
}

export default function Share({text, seed}) {
  const url = "https://crossjig.com/";
  const fullUrl = seed ? `${url}?puzzle=${seed}` : url;

  if (navigator.canShare) {
    return <button onClick={() => handleShare({text, fullUrl})}>Share</button>;
  } else {
    return (
      <button onClick={() => handleCopy({text, fullUrl})}>
        Copy sharing link
      </button>
    );
  }
}
