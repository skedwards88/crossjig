import React from "react";
import {commonWords} from "@skedwards88/word_lists";

const alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

function getMatches(lookupString) {
  if (lookupString === "") {
    return "Enter some letters to find matching words.";
  }

  // Convert the string to a regex pattern
  const pattern = new RegExp(`^${lookupString.replaceAll("*", "[A-Z]")}$`);

  const matches = commonWords.filter((word) => pattern.test(word));

  if (!matches.length) {
    if (lookupString.length < 3) {
      return `No matches found.\n\nTry clicking "Any letter" to add a wildcard.`;
    } else {
      return `No matches found.\n\nTry a different sequence of letters and wildcards.`;
    }
  } else {
    return matches.map((match, index) => <div key={index}>{match}</div>);
  }
}

export default function CustomLookup({setDisplay}) {
  const [lookupString, setLookupString] = React.useState("");

  const letterElements = alphabet.map((letter) => (
    <button
      key={letter}
      id="lookupLetter"
      onClick={() => setLookupString(lookupString + letter)}
    >
      {letter}
    </button>
  ));

  return (
    <div className="App" id="customLookup">
      <div id="lookupResult">{getMatches(lookupString)}</div>
      <div id="lookupString">{lookupString}</div>
      <div id="customLookupControls">
        <button onClick={() => setLookupString(lookupString + "*")}>
          Any letter
        </button>
        <button
          onClick={() =>
            setLookupString(lookupString.slice(0, lookupString.length - 1))
          }
        >
          Backspace
        </button>
        <button onClick={() => setDisplay("custom")}>Exit</button>
      </div>
      <div id="lookupLetters">{letterElements}</div>
    </div>
  );
}
