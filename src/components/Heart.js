import React from "react";

export default function Heart({setDisplay, repoName}) {
  return (
    <div className="App info">
      <div className="infoText">
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
        {`\n\n`}
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
