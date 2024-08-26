import React from "react";
import Share from "./Share";

export default function Heart({setDisplay, appName, shareText, repoName, url}) {
  return (
    <div className="App info">
      <h1>{appName}</h1>
      <div className="infoText">
        {"Like this game? Share it with your friends.\n\n"}
        {<Share appName={appName} text={shareText} url={url}></Share>}
        {`\n`}
        {<hr></hr>}
        {`\n`}
        {"Feedback? "}
        <a
          href={`https://github.com/skedwards88/${repoName}/issues/new/choose`}
        >
          Open an issue
        </a>
        {" on GitHub or email SECTgames@gmail.com."}
        {`\n\n`}
        {<hr></hr>}
        {`\n`}
        {`Thanks to the word frequency data sources attributed in `}
        <a href="https://github.com/skedwards88/word_lists">
          skedwards88/word_lists
        </a>
        {`.`}
        {<hr></hr>}
        {`\n`}
        <a href="./privacy.html">Privacy policy</a>
      </div>
      <button className="close" onClick={() => setDisplay("game")}>
        Close
      </button>
    </div>
  );
}
