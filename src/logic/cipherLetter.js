export function cipherLetter(letter, shift) {
  // Error if the letter is not a single uppercase character
  if (!/^[A-Z]$/.test(letter)) {
    throw new Error("Input must be a single uppercase character A-Z");
  }

  // Convert the letter to its ASCII code
  const ascii = letter.charCodeAt(0);

  // Shift the ASCII by the shift amount, wrapping around if necessary.
  // -65 converts the ASCII code for A-Z to a
  // number between 0 and 25 (corresponding to alphabet position)
  const shiftedAscii = ((((ascii - 65 + shift) % 26) + 26) % 26) + 65;

  const cipheredLetter = String.fromCharCode(shiftedAscii);

  return cipheredLetter;
}
