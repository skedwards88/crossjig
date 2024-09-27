import {customDailyPuzzles} from "../logic/customDailyPuzzles";

export default function getDailySeed() {
  // Get a seed based on today's date 'YYYYMMDD'
  const currentDate = new Date();
  let seed = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}`.toString();

  // Check if there is a custom puzzle for today
  // Otherwise, use the date as the seed
  const customDaily = customDailyPuzzles[seed];
  seed = customDaily || getDailySeed();

  const isCustom = customDaily ? true : false;

  return [seed, isCustom];
}
