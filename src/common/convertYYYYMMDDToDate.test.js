import {convertYYYYMMDDToDate} from "./convertYYYYMMDDToDate";

describe("convertYYYYMMDDToDate", () => {
  test("converts a string in the format 'YYYYMMDD' to a Date object", () => {
    const input = "20240429";
    const expected = new Date(2024, 3, 29);
    expect(convertYYYYMMDDToDate(input)).toEqual(expected);
  });
});
