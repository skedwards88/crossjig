import React from "react";

export default function Heart({setDisplay, repoName}) {
  return (
    <div className="App info">
      <div className="infoText">
        <p>
          Feedback?{" "}
          <a
            href={`https://github.com/skedwards88/${repoName}/issues/new/choose`}
          >
            Open an issue
          </a>{" "}
          on GitHub or email SECTgames@gmail.com.
        </p>
        <hr></hr>
        <p>
          Thanks to the word frequency data sources attributed in{" "}
          <a href="https://github.com/skedwards88/word_lists">
            skedwards88/word_lists
          </a>
          .
        </p>
        <hr></hr>
        <p>
          <a href="./privacy.html">Privacy policy</a>
        </p>
        <small>tl;dr: We only collect anonymous data about usage.</small>
      </div>
      <button className="close" onClick={() => setDisplay("game")}>
        Close
      </button>
    </div>
  );
}
