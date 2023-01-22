import { trie } from "./trie";

export function isKnown(word) {
  let current = trie;
  for (let letter of word) {
    if (current[letter]) {
      current = current[letter];
    } else {
      return { isPartial: false, isWord: false, isEasy: false };
    }
  }
  if (current["endOfWord"]) {
    if (current["easyWord"]) {
      return { isPartial: true, isWord: true, isEasy: true };
    } else {
      return { isPartial: true, isWord: true, isEasy: false };
    }
  } else {
    return { isPartial: true, isWord: false, isEasy: false };
  }
}
