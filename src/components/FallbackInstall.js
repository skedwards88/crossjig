import React from "react";

export default function FallbackInstall({setDisplay}) {
  return (
    <div className="App info">
      <div className="infoText">
        <p>
          Crossjig is a progressive web app, which means that it can be
          installed on your phone for easy access and offline play.
        </p>

        <div className="appStoreButtons">
          <a
            className="appStoreButton"
            id="googlePlayStore"
            href="https://play.google.com/store/apps/details?id=com.crossjig.twa&hl=en_US"
            aria-label="Get it on Google Play"
          ></a>

          <a
            className="appStoreButton"
            id="appleAppStore"
            href="https://apps.apple.com/us/app/crossjig/id6749487838"
            aria-label="Get it on Apple App Store"
          ></a>

          <details>
            <summary>Or install from your browser</summary>
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
          </details>
        </div>
      </div>
      <button className="close" onClick={() => setDisplay("game")}>
        Close
      </button>
    </div>
  );
}
