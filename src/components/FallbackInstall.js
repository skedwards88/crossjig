import React from "react";

export default function FallbackInstall({setDisplay}) {
  return (
    <div className="App info">
      <div className="infoText">
        <p>
          Crossjig is a progressive web app, which means that it can be
          installed on your phone for easy access and offline play.
        </p>
        <p>
          {
            "For iOS: Open Crossjig in Safari and select 'add to home screen' (under the Safari 'share' menu)."
          }
        </p>
        <p>
          {
            "For Android: Open Crossjig in Chrome and select 'install' (under the Chrome ⋮ menu)."
          }
        </p>
        <p>
          For the most up-to-date instructions, do a web search for how to
          install a progressive web app for your phone.
        </p>
      </div>
      <button className="close" onClick={() => setDisplay("game")}>
        Close
      </button>
    </div>
  );
}
