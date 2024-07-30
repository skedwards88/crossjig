import {convertYYYYMMDDToDate} from "./convertYYYYMMDDToDate";

export function hasVisitedSince(savedStateName, resetDateString) {
  let lastVisitedYYYYMMDD = JSON.parse(localStorage.getItem(savedStateName));

  if (!lastVisitedYYYYMMDD) {
    return false;
  }

  const lastVisitedDate = convertYYYYMMDDToDate(lastVisitedYYYYMMDD);

  const resetDate = convertYYYYMMDDToDate(resetDateString);

  return lastVisitedDate >= resetDate;
}
