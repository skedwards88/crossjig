// Various methods of scoring words, to give puzzles themes.
//
// A "theme" is simply a function that takes a word as input and returns a numeric score.
// Higher-scored words are more likely to appear in puzzles. For example, if a theme counts
// the number of times the letter A appears in each word, puzzles using that theme will have lots of
// the letter A.
//
// More precisely: At the beginning of puzzle construction, all words are sorted by score, plus a
// random element. Whenever the algorithm searches for a word to place in the board, the first
// matching word in the list is chosen.
//
// Words that get no points from the puzzle's theme can still be used. This keeps some themes from
// being monotonous, with the same words always chosen.

function sum(array) {
  return array.reduce((a, b) => a + b, 0);
}

// Return any element of the given array, chosen at random with equal probability.
function choice(array, pseudoRandomGenerator) {
  return array[Math.floor(array.length * pseudoRandomGenerator())];
}

// An "S-shaped" function useful for clamping a score boost.
//
//     erf(-Infinity) = -1
//     erf(-1) = -0.843
//     erf(0)  =  0
//     erf(1/4) = 0.276
//     erf(1/2) = 0.520
//     erf(1)  =  0.843
//     erf(2)  =  0.995
//     erf(Infinity) = 1
//
// This function is used to incorporate some variable x into a score, without rewarding extreme
// values. For example, suppose there's a theme that boosts words with multiple U's. The word
// `MUUMUU` has 4 U's, which is simply too strong--`MUUMUU` appears in every puzzle.
//
// Using `erf(x)` limits the effect of the variable x to between 0 and 1 (or between -1 and 1 if
// the variable can be negative). It makes x=1 a very good score (84.3% of the maximum), and x=2
// effectively the maximum score (99.5%).
//
// To give the variable a more gradual effect, use `erf(x/4)` which causes 4 to be a very good
// score instead.
//
// The function is called "S-shaped" because its graph has two regions that curve in opposite
// directions, like the letter S. Such functions are called [sigmoid functions]. This one is
// the [error function]. The implementation is from [picomath].
//
// [sigmoid functions]: https://en.wikipedia.org/wiki/Sigmoid_function
// [error function]: https://en.wikipedia.org/wiki/Error_function
// [picomath]: https://hewgill.com/picomath/javascript/erf.js.html
function erf(x) {
    // constants
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var p  =  0.3275911;

    // Save the sign of x
    var sign = Math.sign(x);
    x = Math.abs(x);

    // A&S formula 7.1.26
    var t = 1.0/(1.0 + p*x);
    var y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);

    return sign*y;
}

// The themes.
//
// Each theme has a `weight`, which tells how often it'll come up when randomly selecting a theme.
// If the weight isn't specified, it's 1.
const THEMES = {
  preferredVowel: {
    weight: 5,  // 5 times as often because this is really 5 different themes (each vowel)
    generate(pseudoRandomGenerator) {
      // Note: Y does not appear in enough words with no other vowels; with finickiness it would
      // produce boring puzzles. So we include Y with the consonants below.
      const VOWELS = "AEIOU";

      let preferredVowel = choice(VOWELS, pseudoRandomGenerator);
      let amplitude = pseudoRandomGenerator();
      let finickiness = pseudoRandomGenerator();
      console.log({preferredVowel, amplitude, finickiness});
      return word => amplitude * erf(sum(
        Array.from(word)
          .map(v => v === preferredVowel ? 1 : "AEIOUY".includes(v) ? -finickiness : 0)
      ));
    },
  },

  preferredConsonant: {
    weight: 21,
    generate(pseudoRandomGenerator) {
      const CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";

      // preferred consonant
      let letter = choice(CONSONANTS, pseudoRandomGenerator);
      let amplitude = pseudoRandomGenerator();
      let saturation = 1/4 + pseudoRandomGenerator();
      console.log({letter, amplitude, saturation});
      return word => amplitude * erf(saturation * (word.split(letter).length - 1));
    },
  },

  // favorite sequence of letters
  preferredCluster: {
    CLUSTERS: `BR BL CH CK CL CR DR FR FL GR GL GH KN LB LD LK LM LP LT LV MB MC MN MP
               PH PL PR PS PT RC RD RF RH RK RV SC SH SK SP ST SW SY TH TR TW TY WH WR`.split(/\s+/g),
    weight: 48,
    generate(pseudoRandomGenerator) {
      let preferredCluster = choice(this.CLUSTERS, pseudoRandomGenerator);
      let amplitude = 1/2 + pseudoRandomGenerator();
      let saturation = 1/2 + pseudoRandomGenerator();
      console.log({preferredCluster, amplitude, saturation});
      return word => amplitude * erf(saturation * Number(word.includes(preferredCluster)));
    },
  },

  doubleConsonants: {
    generate(pseudoRandomGenerator) {
      // double consonants
      let amplitude = 1/2 + pseudoRandomGenerator();
      let saturation = 1/4 + pseudoRandomGenerator();
      console.log({doubleConsonants: true, amplitude, saturation});
      return word => amplitude * erf(saturation * (word.match(/([BDFGLMNPRSTZ])\1/g) ?? []).length);
    },
  },

  doubleVowels: {
    generate(pseudoRandomGenerator) {
      // double vowels
      let amplitude = pseudoRandomGenerator();
      let saturation = 1/4 + pseudoRandomGenerator();
      console.log({doubleVowels: true, amplitude, saturation});
      return word => amplitude * erf(saturation * (word.match(/EE|OO/g) ?? []).length);
    },
  },

  oopsAllVowels: {
    generate(pseudoRandomGenerator) {
      // oops all vowels - This doesn't have as much impact as you'd think; all-vowel words are quite
      // rare.
      let amplitude = 4 * pseudoRandomGenerator();
      let saturation = 1/4 + 2/3 * pseudoRandomGenerator();
      console.log({oopsAllVowels: true, amplitude, saturation});
      return word => amplitude * erf(saturation * sum(
        Array.from(word)
          .map(c => "AEIOUY".includes(c) ? 1 : -1/4)
      ));
    },
  },

  oopsAllConsonants: {
    generate(pseudoRandomGenerator) {
      // oops all consonants
      let amplitude = 4 * pseudoRandomGenerator();
      let saturation = 1/4 + 1/4 * pseudoRandomGenerator();
      console.log({oopsAllConsonants: true, amplitude, saturation});
      return word => amplitude * erf(saturation * (1 - sum(
        Array.from(word)
          .map(c => "AEIOUY".includes(c) ? 1 : 0)
      )));
    },
  },

  compound: {
    generate(pseudoRandomGenerator) {
      let n = Math.floor(2 + 1.5 * pseudoRandomGenerator());
      const subthemes = Array.from({length: n}, _ => randomTheme(pseudoRandomGenerator));
      console.log({type: 'compound'});
      return word => sum(subthemes.map(subtheme => subtheme(word)));
    }
  }
}

const TOTAL_WEIGHT = sum(Object.values(THEMES).map(theme => theme.weight ?? 1));

const THEME_PROBABILITY = 1/2;

function randomTheme(pseudoRandomGenerator) {
  let gas = Math.floor(TOTAL_WEIGHT * pseudoRandomGenerator());
  for (const theme of Object.values(THEMES)) {
    gas -= theme.weight ?? 1;
    if (gas <= 0) {
      return theme.generate(pseudoRandomGenerator);
    }
  }
}

// Return a scoring function for words.
export function maybeTheme(pseudoRandomGenerator) {
  if (pseudoRandomGenerator() < THEME_PROBABILITY) {
    return randomTheme(pseudoRandomGenerator);
  } else {
    console.log("no theme");
    return word => 0;
  }
}
