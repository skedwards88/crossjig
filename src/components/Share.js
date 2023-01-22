import React from "react";

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

  try {
    window.gtag("event", "share", {});
  } catch (error) {
    console.log("tracking error", error);
  }
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
    return <button onClick={() => handleCopy(text)}>Copy for sharing</button>;
  }
}
