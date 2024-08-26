import React from "react";

export default function FallbackInstall({setDisplay}) {
  return (
    <div className="App info">
      <div className="infoText">
        {"This app is a progressive web app, which means that it can be installed on your phone for easy access and offline play.\n\nFor Android, \n\nFor iOS, open Crossjig in Safari and select 'add to home screen' (under the Safari 'share' menu).)\n\n\n\nTo install, do a web search for how to install a progressive web app for your phone."}
      </div>
      <button className="close" onClick={() => setDisplay("game")}>
        Close
      </button>
    </div>
  );
}
