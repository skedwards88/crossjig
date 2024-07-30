export function convertYYYYMMDDToDate(YYYYMMDD) {
  return new Date(
    YYYYMMDD.slice(0, 4),
    YYYYMMDD.slice(4, 6) - 1, // months are 0-indexed
    YYYYMMDD.slice(6, 8),
  );
}
