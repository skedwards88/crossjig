// todo wip new, incomplete file

import {convertGridToRepresentativeString} from "./convertGridToRepresentativeString";

describe("convertGridToRepresentativeString", () => {
  test("converts a 2D grid of single characters and empty strings into a representative string with consecutive empty strings represented by a the number of empty strings. Row breaks are ignored.", () => {
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
      "2LUMPY6L1I5FATTER4L1R1R5A1A1S5M2R6EUREKA4S2A9DRAWS5S5",
    );
  });
});
