import { getTrie } from "@skedwards88/word_logic";
import {
  commonWordsLen3,
  commonWordsLen4,
  commonWordsLen5,
  commonWordsLen6,
  commonWordsLen7,
} from "@skedwards88/word_lists";

export const trie = getTrie(
  [
    ...commonWordsLen3,
    ...commonWordsLen4,
    ...commonWordsLen5,
    ...commonWordsLen6,
    ...commonWordsLen7,
  ],
  []
);
