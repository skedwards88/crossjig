import {cipherLetter} from "./cipherLetter";

describe("cipherLetter", () => {
  test("correctly shifts a middle letter with a positive shift", () => {
    expect(cipherLetter("M", 5)).toBe("R");
  });

  test("correctly shifts a middle letter with a negative shift", () => {
    expect(cipherLetter("M", -5)).toBe("H");
  });

  test("returns the same letter when shifted by 26", () => {
    expect(cipherLetter("M", 26)).toBe("M");
  });

  test("ciphering a letter and then deciphering it with the negative shift returns the original letter", () => {
    const letter = "M";
    const shift = 5;
    const cipheredLetter = cipherLetter(letter, shift);
    const decipheredLetter = cipherLetter(cipheredLetter, -shift);
    expect(decipheredLetter).toBe(letter);
  });

  test("wraps from 'Z' to 'A' with a positive shift", () => {
    expect(cipherLetter("Z", 1)).toBe("A");
  });

  test("wraps from 'A' to 'Z' with a negative shift", () => {
    expect(cipherLetter("A", -1)).toBe("Z");
  });

  test("errors for lowercase letters", () => {
    expect(() => cipherLetter("a", 1)).toThrow(
      "Input must be a single uppercase character A-Z",
    );
  });

  test("errors for non-alphabetical characters", () => {
    expect(() => cipherLetter("1", 1)).toThrow(
      "Input must be a single uppercase character A-Z",
    );
  });

  test("errors for empty strings", () => {
    expect(() => cipherLetter("", 1)).toThrow(
      "Input must be a single uppercase character A-Z",
    );
  });

  test("errors for multiple characters", () => {
    expect(() => cipherLetter("AB", 1)).toThrow(
      "Input must be a single uppercase character A-Z",
    );
  });

  test("errors for objects", () => {
    expect(() => cipherLetter({a: 5}, 1)).toThrow(
      "Input must be a single uppercase character A-Z",
    );
  });

  test("errors for numbers", () => {
    expect(() => cipherLetter(5, 1)).toThrow(
      "Input must be a single uppercase character A-Z",
    );
  });

  test("errors for arrays", () => {
    expect(() => cipherLetter([5], 1)).toThrow(
      "Input must be a single uppercase character A-Z",
    );
  });

  test("errors for undefined", () => {
    expect(() => cipherLetter(undefined, 1)).toThrow(
      "Input must be a single uppercase character A-Z",
    );
  });

  test("errors for null", () => {
    expect(() => cipherLetter(null, 1)).toThrow(
      "Input must be a single uppercase character A-Z",
    );
  });
});
