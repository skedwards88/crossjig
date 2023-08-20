import React from "react";
import Share from "./Share";

export default function Heart({ setDisplay }) {
  const feedbackLink = `https://github.com/skedwards88/crossjig/issues/new`;

  return (
    <div className="App info">
      <h1>Crossjig</h1>
      <div className="infoText">
        {"Like this game? Share it with your friends.\n\n"}
        {<Share text={"Check out this word puzzle!"}></Share>}
        {`\n\n`}
        {<hr></hr>}
        {`\n`}
        {`Want more games? Check `}
        <a href="https://skedwards88.github.io/">these</a>
        {` out. `}
        {`\n\n`}
        {<hr></hr>}
        {`\n`}
        {"Feedback? "}
        <a href={feedbackLink}>Open an issue</a>
        {" on GitHub or email SECTgames@gmail.com."}
        {`\n\n`}
        {<hr></hr>}
        {`\n`}
        {`Thanks to `}
        <a href="https://github.com/wordnik/wordlist">Wordnik</a>
        {` for their open source word list and `}
        <a href="https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists#English">
          Wiktionary
        </a>
        {` and data therein for word frequency data.`}
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
