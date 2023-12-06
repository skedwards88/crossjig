import { getTrie, isKnown } from "@skedwards88/word_logic";
import {
  commonWordsLen2,
  commonWordsLen3,
  commonWordsLen4,
  commonWordsLen5,
  commonWordsLen6,
  commonWordsLen7,
  commonWordsLen8plus,
} from "@skedwards88/word_lists";

export const trie = getTrie(
  [
    ...commonWordsLen2,
    ...commonWordsLen3,
    ...commonWordsLen4,
    ...commonWordsLen5,
    ...commonWordsLen6,
    ...commonWordsLen7,
    ...commonWordsLen8plus,
  ],
  []
);

// True if the word is allowed in the player's answer
export function isAllowedWord(word) {
  return isKnown(word, trie).isWord;
}
