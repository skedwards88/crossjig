import {convertGridToRepresentativeString} from "./convertGridToRepresentativeString";

describe("convertGridToRepresentativeString", () => {
  test("converts a 2D grid of single characters and empty strings into a representative string with consecutive empty strings represented by a the number of empty strings. Row breaks are ignored. The shift amount is prepended to the string.", () => {
    const input = [
      ["", "", "L", "U", "M", "P", "Y", "", "", ""],
      ["", "", "", "L", "", "I", "", "", "", ""],
      ["", "F", "A", "T", "T", "E", "R", "", "", ""],
      ["", "L", "", "R", "", "R", "", "", "", ""],
      ["", "A", "", "A", "", "S", "", "", "", ""],
      ["", "M", "", "", "R", "", "", "", "", ""],
      ["", "E", "U", "R", "E", "K", "A", "", "", ""],
      ["", "S", "", "", "A", "", "", "", "", ""],
      ["", "", "", "", "D", "R", "A", "W", "S", ""],
      ["", "", "", "", "S", "", "", "", "", ""],
    ];

    const output = convertGridToRepresentativeString(input, 0);

    expect(output).toEqual(
      "02LUMPY6L1I5FATTER4L1R1R5A1A1S5M2R6EUREKA4S2A9DRAWS5S5",
    );
  });

  test("shifts the letters by the negative of the amount indicated", () => {
    const input = [
      ["", "", "L", "U", "M", "P", "Y", "", "", ""],
      ["", "", "", "L", "", "I", "", "", "", ""],
      ["", "F", "A", "T", "T", "E", "R", "", "", ""],
      ["", "L", "", "R", "", "R", "", "", "", ""],
      ["", "A", "", "A", "", "S", "", "", "", ""],
      ["", "M", "", "", "R", "", "", "", "", ""],
      ["", "E", "U", "R", "E", "K", "A", "", "", ""],
      ["", "S", "", "", "A", "", "", "", "", ""],
      ["", "", "", "", "D", "R", "A", "W", "S", ""],
      ["", "", "", "", "S", "", "", "", "", ""],
    ];

    const output = convertGridToRepresentativeString(input, 3);

    expect(output).toEqual(
      "32IRJMV6I1F5CXQQBO4I1O1O5X1X1P5J2O6BROBHX4P2X9AOXTP5P5",
    );
  });

  test("if no shift is indicated, the letters are not shifted, and 0 is prepended to the string", () => {
    const input = [
      ["", "", "L", "U", "M", "P", "Y", "", "", ""],
      ["", "", "", "L", "", "I", "", "", "", ""],
      ["", "F", "A", "T", "T", "E", "R", "", "", ""],
      ["", "L", "", "R", "", "R", "", "", "", ""],
      ["", "A", "", "A", "", "S", "", "", "", ""],
      ["", "M", "", "", "R", "", "", "", "", ""],
      ["", "E", "U", "R", "E", "K", "A", "", "", ""],
      ["", "S", "", "", "A", "", "", "", "", ""],
      ["", "", "", "", "D", "R", "A", "W", "S", ""],
      ["", "", "", "", "S", "", "", "", "", ""],
    ];

    const output = convertGridToRepresentativeString(input);

    expect(output).toEqual(
      "02LUMPY6L1I5FATTER4L1R1R5A1A1S5M2R6EUREKA4S2A9DRAWS5S5",
    );
  });

  test("errors if the cipher shift is not an integer", () => {
    const input = [
      ["", "", "L", "U", "M", "P", "Y", "", "", ""],
      ["", "", "", "L", "", "I", "", "", "", ""],
      ["", "F", "A", "T", "T", "E", "R", "", "", ""],
      ["", "L", "", "R", "", "R", "", "", "", ""],
      ["", "A", "", "A", "", "S", "", "", "", ""],
      ["", "M", "", "", "R", "", "", "", "", ""],
      ["", "E", "U", "R", "E", "K", "A", "", "", ""],
      ["", "S", "", "", "A", "", "", "", "", ""],
      ["", "", "", "", "D", "R", "A", "W", "S", ""],
      ["", "", "", "", "S", "", "", "", "", ""],
    ];

    expect(() => convertGridToRepresentativeString(input, 1.5)).toThrow(
      "Input cipherShift must be a single digit integer",
    );
  });

  test("errors if the cipher shift is not between 0 and 9", () => {
    const input = [
      ["", "", "L", "U", "M", "P", "Y", "", "", ""],
      ["", "", "", "L", "", "I", "", "", "", ""],
      ["", "F", "A", "T", "T", "E", "R", "", "", ""],
      ["", "L", "", "R", "", "R", "", "", "", ""],
      ["", "A", "", "A", "", "S", "", "", "", ""],
      ["", "M", "", "", "R", "", "", "", "", ""],
      ["", "E", "U", "R", "E", "K", "A", "", "", ""],
      ["", "S", "", "", "A", "", "", "", "", ""],
      ["", "", "", "", "D", "R", "A", "W", "S", ""],
      ["", "", "", "", "S", "", "", "", "", ""],
    ];

    expect(() => convertGridToRepresentativeString(input, 11)).toThrow(
      "Input cipherShift must be a single digit integer",
    );

    expect(() => convertGridToRepresentativeString(input, -1)).toThrow(
      "Input cipherShift must be a single digit integer",
    );
  });
});
