import React from "react";
import sendAnalytics from "../common/sendAnalytics";

function handleShare(text) {
  navigator
    .share({
      title: "Crossjig",
      text: `${text}\n\n`,
      url: "https://crossjig.com/",
    })
    .then(() => console.log("Successful share"))
    .catch((error) => {
      // copy to clipboard as backup
      handleCopy(text);
      console.log("Error sharing", error);
    });
  sendAnalytics("share");
}

function handleCopy(text) {
  try {
    navigator.clipboard.writeText(`${text}\n\nhttps://crossjig.com/`);
  } catch (error) {
    console.log(error);
  }
}

export default function Share({ text }) {
  if (navigator.canShare) {
    return <button onClick={() => handleShare(text)}>Share</button>;
  } else {
    return <button onClick={() => handleCopy(text)}>Copy sharing link</button>;
  }
}
