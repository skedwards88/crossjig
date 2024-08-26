import {convertRepresentativeStringToGrid} from "./convertRepresentativeStringToGrid";

describe("convertRepresentativeStringToGrid", () => {
  test("converts a representative string with consecutive empty strings represented by a the number of empty strings into a 2D grid of single characters and empty strings.", () => {
    const input = "02ABCDE6F1G5HIJKLM4N1O1P5Q1R1S5T2U6VWXYZA4B2C9DEFGH5I5";

    const output = convertRepresentativeStringToGrid(input);

    expect(output).toEqual([
      ["", "", "A", "B", "C", "D", "E", "", "", ""],
      ["", "", "", "F", "", "G", "", "", "", ""],
      ["", "H", "I", "J", "K", "L", "M", "", "", ""],
      ["", "N", "", "O", "", "P", "", "", "", ""],
      ["", "Q", "", "R", "", "S", "", "", "", ""],
      ["", "T", "", "", "U", "", "", "", "", ""],
      ["", "V", "W", "X", "Y", "Z", "A", "", "", ""],
      ["", "B", "", "", "C", "", "", "", "", ""],
      ["", "", "", "", "D", "E", "F", "G", "H", ""],
      ["", "", "", "", "I", "", "", "", "", ""],
    ]);
  });

  test("shifts the letters by the amount indicated by the first character", () => {
    const input = "32ABCDE6F1G5HIJKLM4N1O1P5Q1R1S5T2U6VWXYZA4B2C9DEFGH5I5";

    const output = convertRepresentativeStringToGrid(input);

    expect(output).toEqual([
      ["", "", "D", "E", "F", "G", "H", "", "", ""],
      ["", "", "", "I", "", "J", "", "", "", ""],
      ["", "K", "L", "M", "N", "O", "P", "", "", ""],
      ["", "Q", "", "R", "", "S", "", "", "", ""],
      ["", "T", "", "U", "", "V", "", "", "", ""],
      ["", "W", "", "", "X", "", "", "", "", ""],
      ["", "Y", "Z", "A", "B", "C", "D", "", "", ""],
      ["", "E", "", "", "F", "", "", "", "", ""],
      ["", "", "", "", "G", "H", "I", "J", "K", ""],
      ["", "", "", "", "L", "", "", "", "", ""],
    ]);
  });

  test("returns an empty grid if there are no letters in the string", () => {
    const input = "364";

    const output = convertRepresentativeStringToGrid(input);

    expect(output).toEqual([
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ]);
  });

  test("errors if input string contains characters other than letters and numbers", () => {
    const input = "2-ABCDE5G";
    expect(() => convertRepresentativeStringToGrid(input)).toThrow(
      "Input string must only contain letters and numbers, and must not be empty",
    );
  });

  test("errors if input string is empty", () => {
    const input = "";
    expect(() => convertRepresentativeStringToGrid(input)).toThrow(
      "Input string must only contain letters and numbers, and must not be empty",
    );
  });

  test("errors if first character is not an integer", () => {
    const input = "ABCDEFGHI";
    expect(() => convertRepresentativeStringToGrid(input, 3.5)).toThrow(
      "First character in input string must be an integer that represents the cipher shift",
    );
  });

  test("throws an error if the resulting list does not form a square grid", () => {
    const input = "0AB2EF4";
    expect(() => convertRepresentativeStringToGrid(input)).toThrow(
      "Input string does not form a square grid",
    );
  });

  test("throws an error if the resulting grid is smaller than 8x8", () => {
    const input = "0AB2EF3";
    expect(() => convertRepresentativeStringToGrid(input)).toThrow(
      "Input string must form a grid between 8x8 and 14x14",
    );
  });

  test("throws an error if the resulting grid is larger than 14x14", () => {
    const input = "0AB221CD";
    expect(() => convertRepresentativeStringToGrid(input)).toThrow(
      "Input string must form a grid between 8x8 and 14x14",
    );
  });
});
