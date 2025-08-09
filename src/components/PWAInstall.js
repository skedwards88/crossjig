import React from "react";
import GooglePlayStore from "./GooglePlayStore";
import AppleStore from "./AppleStore";

function getInstructionsForPlatform() {
  const userAgent = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isChromium = /Chrome|Chromium|Edg\//.test(userAgent);
  const isDesktop = !/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);

  if (isIOS && isSafari) {
    return (
      <>
        <h3>Install on iPhone/iPad (Safari)</h3>
        <ol>
          <li>{`Open the 'share' menu in Safari`}</li>
          <li>
            Tap <strong>Add to Home Screen</strong>
          </li>
          <li>
            Tap <strong>Add</strong>
          </li>
        </ol>
        <p>Or, install from the app store:</p>
        <AppleStore />
      </>
    );
  }

  if (isIOS && !isSafari) {
    return (
      <>
        <h3>Install on iPhone/iPad</h3>
        <small>iOS only supports install from Safari</small>
        <ol>
          <li>
            Open <a href="https://crossjig.com/">crossjig.com</a> in Safari
          </li>
          <li>{`Open the 'share' menu in Safari`}</li>
          <li>
            Tap <strong>Add to Home Screen</strong>
          </li>
          <li>
            Tap <strong>Add</strong>
          </li>
        </ol>
        <p>Or, install from the app store:</p>
        <AppleStore />
      </>
    );
  }

  if (isAndroid && isChromium) {
    return (
      <>
        <h3>Install on Android (Chrome/Edge)</h3>
        <ol>
          <li>Open the the browser menu (⋮)</li>
          <li>
            Tap <strong>Install</strong> or <strong>Add to Home Screen</strong>
          </li>
          <li>Confirm to install</li>
        </ol>
        <p>Or, install from the app store:</p>
        <GooglePlayStore />
      </>
    );
  }

  if (isAndroid && !isChromium) {
    return (
      <>
        <h3>Install on Android</h3>
        <p>Your current browser may not support one-click install. You can:</p>
        <ul>
          <li>
            Look for <strong>Install</strong> or{" "}
            <strong>Add to Home screen</strong> in your browser
          </li>
          <li>
            Do a web search for how to install a progressive web app on your
            browser
          </li>
          <li>
            Open <a href="https://crossjig.com/">crossjig.com</a> in Chrome,
            which supports one-click install
          </li>
        </ul>
        <p>Or, install from the app store:</p>
        <GooglePlayStore />
      </>
    );
  }

  if (isDesktop) {
    return (
      <>
        <p>
          It looks like you are on a desktop device. To install, open{" "}
          <a href="https://crossjig.com/">crossjig.com</a> on your phone or
          tablet.{" "}
        </p>
        <p>Or, install from the app store:</p>
        <div className="appStoreButtons">
          <GooglePlayStore />
          <AppleStore />
        </div>
      </>
    );
  }

  return (
    <>
      <p>{`I can't detect which install instructions to show you. Your current browser may not support one-click PWA install.`}</p>
      <p>
        You can look for an <strong>Install</strong> or{" "}
        <strong>Add to Home screen</strong> option in your browser.
      </p>
      <p>Or, install from the app store:</p>
      <div className="appStoreButtons">
        <GooglePlayStore />
        <AppleStore />
      </div>
    </>
  );
}

export default function PWAInstall({setDisplay}) {
  return (
    <div className="App info">
      <div className="infoText">{getInstructionsForPlatform()}</div>
      <button className="close" onClick={() => setDisplay("game")}>
        Close
      </button>
    </div>
  );
}
